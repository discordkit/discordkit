import type { DiscordClient } from "../client.js";
import type { FfiFunction, FfiLibrary, FfiOpaque } from "./backend.js";

/**
 * Shared FFI binding machinery, factored out of the per-feature modules.
 *
 * Every feature (presence, auth, …) used to repeat the same three things: a `Bindings` interface, a `WeakMap<lib, Bindings>` cache, and a factory that builds each `lib.func(...)` / `lib.defineCallback(...)` once per library. This module collapses that to a single declarative call ({@link defineBindings}) plus the callback→promise helper ({@link awaitResult}) and the shared `ClientResult` reader ({@link isResultSuccessful}).
 *
 * Keeping this here (and binding lazily) preserves the tree-shaking boundary: a feature module still only references the C functions it declares, so importing one feature pulls in no other.
 */

/**
 * A binding declaration: either a C function signature string (bound via
 * {@link FfiLibrary.func}) or a callback prototype (bound via
 * {@link FfiLibrary.defineCallback}, for use with {@link FfiLibrary.registerCallback}).
 */
export type BindingDecl = string | { readonly callback: string };

/** A bound declaration record: functions are callable, callbacks are opaque types. */
type Bound<T extends Record<string, BindingDecl>> = {
  [K in keyof T]: T[K] extends { callback: string } ? FfiOpaque : FfiFunction;
};

/**
 * Declare a set of C bindings once and get a `(lib) => bindings` accessor that builds them on first use per library and caches the result. Each feature module calls this at load with its own declaration map; the returned accessor is what feature operations call to get their (lazily-bound, cached) functions.
 *
 * @example
 * ```ts
 * const bindings = defineBindings({
 *   init: `void Discord_Activity_Init(void *self)`,
 *   update: `void Discord_Client_UpdateRichPresence(void *self, void *activity, void *cb, void *cbFree, void *cbUserData)`,
 *   updateCb: { callback: `void UpdateRichPresenceCallback(void *result, void *userData)` }
 * });
 * // later, in an operation:
 * const b = bindings(client.lib);
 * b.init(handle);
 * ```
 */
export const defineBindings = <const T extends Record<string, BindingDecl>>(
  decls: T
): ((lib: FfiLibrary) => Bound<T>) => {
  const cache = new WeakMap<FfiLibrary, Bound<T>>();
  return (lib) => {
    const cached = cache.get(lib);
    if (cached) return cached;
    // FfiOpaque is `unknown`, so the accumulator is just Record<string, unknown>;
    // the per-key types are recovered by the Bound<T> cast (function vs callback
    // type, driven by each decl's shape — which TS can't infer through the loop).
    const bound: Record<string, unknown> = {};
    for (const [key, decl] of Object.entries(decls)) {
      bound[key] =
        typeof decl === `string`
          ? lib.func(decl)
          : lib.defineCallback(decl.callback);
    }
    const result = bound as Bound<T>;
    cache.set(lib, result);
    return result;
  };
};

/** Bindings shared by every result-returning async op (every feature needs this). */
const resultBindings = defineBindings({
  successful: /* C */ `bool Discord_ClientResult_Successful(void *self)`,
  errorToString: /* C */ `void Discord_ClientResult_ToString(void *self, Discord_String *returnValue)`
});

/** Whether a `Discord_ClientResult*` (from an SDK callback) reports success. */
export const isResultSuccessful = (
  client: DiscordClient,
  result: unknown
): boolean => Boolean(resultBindings(client.lib).successful(result));

/** Read the human-readable error off an unsuccessful `Discord_ClientResult*`. */
export const resultErrorMessage = (
  client: DiscordClient,
  result: unknown
): string => {
  const out = client.lib.allocStringOut();
  resultBindings(client.lib).errorToString(result, out);
  return client.lib.decodeString(out);
};

/**
 * Drive one SDK async operation that completes via a result-bearing callback, as a promise. Registers `callbackType`, invokes `start(cb)` (which calls the SDK function passing `cb`), and resolves/rejects when the callback fires — extracting a value via `onResult`, or rejecting with the result's error string. Rejects (never hangs) after `timeoutMs`, since these complete over an RPC link to the local Discord client that may not be up.
 *
 * @param onResult maps the callback's args (after the `result` pointer) to the resolved value; return `void`/`undefined` for ops that resolve with nothing.
 */
export const awaitResult = async <T = void>(
  client: DiscordClient,
  callbackType: FfiOpaque,
  start: (cb: FfiOpaque) => void,
  onResult: (...args: unknown[]) => T,
  { timeoutMs = 10_000, label = `operation` }: ResultOptions = {}
): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(
        new Error(
          `Discord ${label} timed out after ${timeoutMs}ms with no response ` +
            `from the local Discord client. Is the Discord desktop app running?`
        )
      );
    }, timeoutMs);
    // unref so a pending timeout never keeps the process alive (Node-only; the
    // optional chain no-ops where it's absent).
    (timer as { unref?: () => void }).unref?.();

    const cb = client.lib.registerCallback(
      callbackType,
      (result: unknown, ...rest: unknown[]) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (isResultSuccessful(client, result)) {
          resolve(onResult(...rest));
          return;
        }
        reject(
          new Error(
            `Discord ${label} failed: ${resultErrorMessage(client, result)}`
          )
        );
      }
    );
    client.trackCallback(cb);
    start(cb);
  });

/** Options for {@link awaitResult}. */
export interface ResultOptions {
  /** Reject if the SDK hasn't acked within this many ms. Default 10000. */
  timeoutMs?: number;
  /** Name used in timeout/failure messages (e.g. `rich presence update`). */
  label?: string;
}

/**
 * A transient native sub-object handle (e.g. an `ActivityAssets` built to attach to an `Activity`) that owns its own teardown. Used with `using` so the `Discord_*_Drop` runs automatically at scope exit — centralizing cleanup on the handle instead of making every caller remember to drop it. NOT a class (no lifecycle beyond dispose); just a disposable record.
 */
export interface SubObjectHandle extends Disposable {
  /** The native handle pointer, to pass to the parent's attach function. */
  readonly handle: FfiOpaque;
}

/** Wrap a native handle + its drop into a {@link SubObjectHandle} for `using`. */
export const subObjectHandle = (
  handle: FfiOpaque,
  drop: () => void
): SubObjectHandle => ({
  handle,
  [Symbol.dispose]: drop
});
