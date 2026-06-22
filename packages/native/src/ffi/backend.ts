/**
 * FFI backend seam.
 *
 * Every part of this package that touches the native boundary depends ONLY on
 * the {@link FfiBackend} shape below — never on a concrete FFI library. Today
 * the sole implementation is {@link ./koffi-backend.ts | Koffi}; Node's built-in
 * `node:ffi` (Node 26+) is the long-term target and slots in as a second
 * implementation behind this interface, making the migration a single new file
 * rather than a rewrite of every call site.
 *
 * The surface is the minimal set of primitives the Discord Social SDK C ABI
 * (`cdiscord.h`) actually needs:
 *
 * - **Opaque handles** are single-pointer structs (`struct Discord_Client {
 *   void* opaque; }`). {@link FfiLibrary.allocHandle} returns one to pass to the
 *   SDK's `*_Init`/`*_Drop` functions.
 * - **Strings** cross as `Discord_String { uint8_t* ptr; size_t size }` (UTF-8,
 *   length-prefixed, NOT null-terminated). {@link FfiLibrary.decodeString} reads
 *   one passed by value into a callback.
 * - **Callbacks** thread a JS function into C via {@link FfiLibrary.registerCallback};
 *   the SDK invokes them on the thread that calls `Discord_RunCallbacks`, which we
 *   only ever do on the main thread, so callbacks land on the main thread by
 *   construction.
 */

/**
 * An opaque, backend-specific value. The binding layer holds these without
 * inspecting them — a callback handle, a pointer struct, a prototype, etc.
 * Typed as `unknown` so no koffi/node:ffi type leaks across the seam.
 */
export type FfiOpaque = unknown;

/**
 * A C function bound from the library, callable with marshaled JS arguments.
 * Args are `any` because they cross the FFI boundary untyped — the binding layer
 * supplies correctly-shaped values per the C signature it declared. (Rest-arg
 * `any` is the sanctioned escape here; see the lint config's `ignoreRestArgs`.)
 */
export type FfiFunction = (...args: any[]) => unknown;

/** A `Discord_String { uint8_t* ptr; size_t size }` as received in a callback. */
export interface DiscordStringValue {
  ptr: FfiOpaque;
  size: number | bigint;
}

export interface FfiLibrary {
  /**
   * Bind a C function by its full signature, e.g.
   * `"void Discord_Client_Init(Discord_Client *self)"`. Struct/typedef names
   * used in the signature must already be known to the backend (the Koffi
   * backend registers `Discord_Client` and `Discord_String` on load).
   */
  func: (declaration: string) => FfiFunction;

  /**
   * Declare a C callback prototype, e.g.
   * `"void LogCallback(Discord_String message, int severity, void *userData)"`.
   * Returns an opaque type handle for {@link registerCallback}.
   */
  defineCallback: (declaration: string) => FfiOpaque;

  /**
   * Wrap a JS function as a C function pointer for `type` (from
   * {@link defineCallback}). The returned handle is persistent — it stays valid
   * until {@link unregisterCallback}, so it survives past the call that passes
   * it and fires on later `Discord_RunCallbacks` pumps.
   */
  registerCallback: (
    type: FfiOpaque,
    fn: (...args: any[]) => void
  ) => FfiOpaque;

  /** Release a callback handle from {@link registerCallback}. */
  unregisterCallback: (handle: FfiOpaque) => void;

  /**
   * Allocate a single-pointer opaque handle struct (`{ void* opaque }`) and
   * return a pointer to it, suitable for the SDK's `*_Init`/`*_Drop` functions
   * and for opaque-handle out-params (e.g. `CreateAuthorizationCodeVerifier`).
   */
  allocHandle: () => FfiOpaque;

  /**
   * Allocate a `Discord_String`-sized buffer (`{ uint8_t* ptr; size_t size }`)
   * for a `Discord_String*` OUT-param the SDK writes into (e.g.
   * `GetDefaultPresenceScopes`, `Verifier`). MUST be used instead of
   * {@link allocHandle} for string out-params: a `Discord_String` is wider than
   * a single pointer, so a handle-sized buffer overflows when the SDK writes the
   * string back. Pass the result to the C function, then {@link decodeString} it.
   */
  allocStringOut: () => FfiOpaque;

  /**
   * Allocate a span OUT-param buffer (`{ T* ptr; size_t size }`) for the SDK's
   * list-returning getters (e.g. `GetRelationships`, `SearchFriendsByUsername`,
   * lobby members, messages). The SDK writes a contiguous array of element
   * handles + a count. Pass the result to the C function, then {@link readSpan}
   * it to get one opaque handle per element. A span is two pointers wide, so —
   * like {@link allocStringOut} — it must NOT use {@link allocHandle}.
   */
  allocSpanOut: () => FfiOpaque;

  /**
   * Read a span buffer (filled by a list-returning getter via
   * {@link allocSpanOut}) into an array of opaque element handles — one per
   * element, each usable wherever a `void *` handle is expected (e.g. passed to
   * the element type's getters). Elements are inline handle structs
   * (`{ void* opaque }`); this slices them out by index.
   */
  readSpan: (span: FfiOpaque) => FfiOpaque[];

  /**
   * Read a `Discord_UInt64Span` (`{ uint64_t* ptr; size_t size }`) — the SDK's
   * scalar-id list getters (`GetLobbyIds`, `LobbyHandle::LobbyMemberIds`) — into
   * a `bigint[]`. Distinct from {@link readSpan}: elements are raw `uint64_t`
   * values decoded in place, not pointers to handle structs. Use the SAME
   * {@link allocSpanOut} buffer (both spans are two machine words: ptr + size).
   */
  readUInt64Span: (span: FfiOpaque) => bigint[];

  /**
   * Read a `Discord_Properties` (`{ size_t size; Discord_String* keys;
   * Discord_String* values }`) — the SDK's string→string metadata maps
   * (`LobbyHandle::Metadata`, `LobbyMemberHandle::Metadata`) — into a plain
   * object. Allocate the out-param with {@link allocPropertiesOut}.
   */
  readProperties: (out: FfiOpaque) => Record<string, string>;

  /** Allocate a `Discord_Properties` OUT-param buffer for {@link readProperties}. */
  allocPropertiesOut: () => FfiOpaque;

  /**
   * Allocate a `uint64_t` OUT-param buffer for the SDK's bool-gated scalar
   * getters (`bool getter(self, uint64_t* out)`, e.g. `GuildChannel::ParentId`).
   * Pass it to the getter, then {@link readUInt64Out} it when the bool is true.
   */
  allocUInt64Out: () => FfiOpaque;

  /** Read a `uint64_t` OUT-param buffer (from {@link allocUInt64Out}) as a bigint. */
  readUInt64Out: (out: FfiOpaque) => bigint;

  /**
   * Encode a plain object as a `Discord_Properties` to pass INTO the SDK BY VALUE
   * (e.g. `CreateOrJoinLobbyWithMetadata`'s metadata args). The SDK copies the
   * contents synchronously, so the backing arrays only need to outlive the call.
   */
  encodeProperties: (value: Record<string, string>) => FfiOpaque;

  /**
   * Decode a `Discord_String` — received by value in a callback, or written into
   * an {@link allocStringOut} buffer — into a JS string. Accepts any backend
   * value; guards for the `{ ptr, size }` shape and returns `""` otherwise.
   */
  decodeString: (value: unknown) => string;

  /**
   * Encode a JS string as a `Discord_String` to pass INTO the SDK by VALUE
   * (a `Discord_String` argument). The SDK copies string contents internally, so
   * the backing bytes only need to outlive the synchronous call.
   */
  encodeString: (value: string) => DiscordStringValue;

  /**
   * Encode a JS string as a POINTER to a `Discord_String`, for params typed
   * `Discord_String*` (e.g. `Discord_Activity_SetState/SetDetails`, which take a
   * nullable pointer). Distinct from {@link encodeString} (by value) — passing a
   * by-value struct where a pointer is expected silently mis-sets the field.
   */
  encodeStringPtr: (value: string) => FfiOpaque;
}

/** A backend is just a function that opens a shared library. */
export type FfiBackend = (libraryPath: string) => FfiLibrary;
