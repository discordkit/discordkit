import type {
  FfiBackend,
  FfiLibrary,
  FfiFunction,
  FfiOpaque,
  DiscordStringValue
} from "../ffi/backend.js";

/**
 * A pure-TypeScript {@link FfiBackend} for contract tests — no native code, no
 * compiler, runs anywhere. It fulfills the same seam the Koffi backend does, so
 * `createClient({ backend: mockBackend })` exercises ALL of our binding logic
 * (lifecycle, status-signal wiring, the per-feature call sequences, dispose)
 * without the redistribution-restricted real SDK.
 *
 * This module is ONLY the universal plumbing: call recording, string/handle/span
 * marshaling, the callback register-and-fire mechanism, the status pump, and the
 * `Discord_Client` lifecycle. Each feature DOMAIN supplies its own `Discord_*`
 * behavior by registering handlers (see {@link registerMockHandlers}), kept next
 * to that domain's tests rather than piled into one giant switch.
 *
 * NOTE: koffi's *marshaling* correctness (struct-by-value, pointer params,
 * cross-ABI callback delivery) is covered by the real-SDK smoke test, not here —
 * this verifies OUR code, which is where the bugs live.
 */

/** Mock string tag — what `encodeString` produces and `decodeString` reads. */
export interface MockString {
  __str: string;
}

const isMockString = (v: unknown): v is MockString =>
  typeof v === `object` &&
  v !== null &&
  typeof (v as MockString).__str === `string`;

/**
 * What a domain handler receives: the C function name, its raw args, and the
 * shared marshaling + callback helpers. Handlers return the C function's result
 * (or `undefined` for void), or the `PASS` sentinel to defer to the next stage.
 */
export interface MockContext {
  readonly name: string;
  readonly args: unknown[];
  /** The per-library mock state — domains key their own scripted data off this
   * (via a `WeakMap<MockState, …>` in the domain's mock module). */
  readonly state: MockState;
  /** Decode a mock `Discord_String` value/out-param to a JS string. */
  decodeString: (value: unknown) => string;
  /** Write a string into a mock `Discord_String*` out-param object. */
  writeString: (out: unknown, value: string) => void;
  /** Fire the result-bearing callback passed in `args` (success), with extra
   * post-result callback values. Used by async ops that ack via a callback. */
  fireResultCallback: (...afterResult: unknown[]) => void;
  /** Invoke a specific registered callback handle with raw args (no implicit
   * `result` prefix). For persistent event subscriptions whose callback's first
   * arg is NOT a `ClientResult` (e.g. `ActivityInviteCallback(invite)`). */
  invokeCallback: (handle: unknown, ...args: unknown[]) => void;
  /** Allocate a fresh opaque handle (same shape the binding layer gets). */
  allocHandle: () => FfiOpaque;
}

/** A domain's handlers: C function name → behavior. */
export type MockHandlers = Record<string, (ctx: MockContext) => unknown>;

/**
 * Universal mock state every test can read (call log + lifecycle flags). Domain-
 * specific scripted state lives on each domain's own mock module, not here.
 */
export interface MockState {
  /** Names of every C function invoked, in order. */
  readonly calls: string[];
  /** Resolved application id passed to `SetApplicationId`. */
  applicationId?: bigint;
  /** Whether `Discord_Client_Drop` has been called. */
  dropped: boolean;
  /** Count of registered-but-not-unregistered callbacks (leak check). */
  liveCallbacks: number;
  /** Force the next pump to advance the scripted status by one step. */
  readonly pump: () => void;
}

/**
 * Domain handler registrations, keyed by C function name. Populated at module
 * load by each domain's mock module (which imports this and calls
 * {@link registerMockHandlers}). Global because the backend is constructed fresh
 * per client but the handler *behavior* is domain-static.
 */
const handlers: MockHandlers = {};

/** Register a domain's `Discord_*` handlers. Call once at module load. */
export const registerMockHandlers = (domain: MockHandlers): void => {
  Object.assign(handlers, domain);
};

const states = new WeakMap<FfiLibrary, MockState>();

/** Retrieve the {@link MockState} for a mock-backed client's library. */
export const mockStateOf = (lib: FfiLibrary): MockState => {
  const s = states.get(lib);
  if (!s) throw new Error(`not a mock-backed library`);
  return s;
};

const STATUS_SEQUENCE = [1, 2, 3]; // Connecting, Connected, Ready

export const mockBackend: FfiBackend = (_libraryPath: string): FfiLibrary => {
  type Handler = (...args: any[]) => void;
  const calls: string[] = [];
  const registered = new Map<symbol, Handler>();
  let statusCb: Handler | undefined;
  let logCb: Handler | undefined;
  let statusStep = 0;

  const handle = (): FfiOpaque => ({ __mock: `handle` });

  const decodeString = (value: unknown): string =>
    isMockString(value) ? value.__str : ``;
  const encodeString = (value: string): DiscordStringValue => {
    const tagged: MockString = { __str: value };
    return tagged as unknown as DiscordStringValue;
  };
  const encodeStringPtr = (value: string): unknown => ({ __str: value });
  const writeString = (out: unknown, value: string): void => {
    (out as MockString).__str = value;
  };

  /** Fire the result-bearing callback referenced in `args` (the first symbol),
   * passing a null result (success) + any post-result values. */
  const fireCallback = (args: unknown[], afterResult: unknown[]): void => {
    const cb = args.find((a) => typeof a === `symbol`);
    if (cb) registered.get(cb)?.(null, ...afterResult);
  };

  /** Invoke a registered callback handle directly with raw args (no `result`). */
  const invokeCallback = (handle: unknown, ...args: unknown[]): void => {
    if (typeof handle === `symbol`) registered.get(handle)?.(...args);
  };

  const lib: FfiLibrary = {
    func: (declaration: string): FfiFunction => {
      const name = /\b(Discord_\w+)\s*\(/.exec(declaration)?.[1] ?? declaration;
      return (...args: any[]): unknown => {
        calls.push(name);
        // Universal lifecycle / status / result functions.
        switch (name) {
          case `Discord_Client_SetApplicationId`:
            state.applicationId = args[1] as bigint;
            return undefined;
          case `Discord_Client_Drop`:
            state.dropped = true;
            return undefined;
          case `Discord_Client_Init`:
          case `Discord_Client_SetStatusChangedCallback`:
          case `Discord_Client_AddLogCallback`:
            return undefined;
          case `Discord_RunCallbacks`:
            if (statusStep < STATUS_SEQUENCE.length && statusCb) {
              statusCb(STATUS_SEQUENCE[statusStep], 0, 0);
              statusStep++;
            }
            if (statusStep === 1) logCb?.({ __str: `mock connecting` }, 2);
            return undefined;
          case `Discord_ClientResult_Successful`:
            return true;
          default:
            break;
        }
        // Domain-registered behavior.
        const domain = handlers[name];
        if (domain) {
          return domain({
            name,
            args,
            state,
            decodeString,
            writeString,
            fireResultCallback: (...afterResult) =>
              fireCallback(args, afterResult),
            invokeCallback,
            allocHandle: handle
          });
        }
        return undefined;
      };
    },
    defineCallback: (declaration: string): FfiOpaque => ({
      __proto: declaration
    }),
    registerCallback: (type, fn): FfiOpaque => {
      const key = Symbol(`cb`);
      registered.set(key, fn);
      const decl =
        typeof type === `object` && type !== null && `__proto` in type
          ? String((type as { __proto: unknown }).__proto)
          : ``;
      if (decl.includes(`OnStatusChanged`)) statusCb = fn;
      if (decl.includes(`LogCallback`)) logCb = fn;
      return key;
    },
    unregisterCallback: (h): void => {
      registered.delete(h as symbol);
    },
    allocHandle: handle,
    allocStringOut: handle,
    allocSpanOut: (): FfiOpaque => ({ __span: [] as FfiOpaque[] }),
    readSpan: (span): FfiOpaque[] =>
      (span as { __span?: FfiOpaque[] }).__span ?? [],
    readUInt64Span: (span): bigint[] =>
      (span as { __span?: bigint[] }).__span ?? [],
    allocPropertiesOut: (): FfiOpaque => ({
      __props: {} as Record<string, string>
    }),
    readProperties: (out): Record<string, string> =>
      (out as { __props?: Record<string, string> }).__props ?? {},
    encodeProperties: (value): FfiOpaque => ({ __props: value }),
    allocUInt64Out: (): FfiOpaque => ({ __u64: 0n }),
    readUInt64Out: (out): bigint => (out as { __u64?: bigint }).__u64 ?? 0n,
    decodeString,
    encodeString,
    encodeStringPtr
  };

  const state: MockState = {
    calls,
    dropped: false,
    get liveCallbacks() {
      return registered.size;
    },
    pump: () => {
      lib.func(/* C */ `void Discord_RunCallbacks()`)();
    }
  };
  states.set(lib, state);
  return lib;
};
