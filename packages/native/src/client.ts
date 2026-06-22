import { Signal } from "signal-polyfill";
import { koffiBackend } from "./ffi/koffi-backend.js";
import type { FfiBackend, FfiLibrary, FfiOpaque } from "./ffi/backend.js";
import { resolveLibraryPath } from "./resolveLibrary.js";
import type { Subscription } from "./subscription.js";
import type { TokenStore } from "./auth/tokenStore.js";
import {
  LOG_SEVERITY_CODE,
  LOG_SEVERITY_BY_CODE,
  STATUS_BY_CODE,
  type LogEntry,
  type Status
} from "./types.js";

/** Configuration for {@link createClient} (and the ambient {@link init}). */
export interface ClientConfig {
  /**
   * Your Discord application ID. Falls back to `DISCORD_APPLICATION_ID`.
   * Accepts a bigint, a numeric string, or a number (snowflakes exceed 2^53,
   * so prefer bigint or string).
   */
  applicationId?: bigint | string | number;
  /**
   * Path to the Social SDK shared library or its root directory. Falls back to
   * `DISCORD_SDK_PATH`, then conventional locations. See {@link resolveLibraryPath}.
   */
  libraryPath?: string;
  /** Minimum log severity to deliver to {@link DiscordClient.onLog}. Default `info`. */
  minLogSeverity?: keyof typeof LOG_SEVERITY_CODE;
  /**
   * How often (ms) to pump `Discord_RunCallbacks`. Default 16ms (~60Hz). The
   * pump runs on the main thread; callbacks fire synchronously inside it.
   */
  pumpIntervalMs?: number;
  /** FFI backend. Defaults to Koffi; injectable for tests / future node:ffi. */
  backend?: FfiBackend;
  /**
   * Where to persist OAuth tokens for silent reconnect across launches. When set,
   * the session layer (`startSession`) reloads + refreshes tokens on launch and
   * saves them after authorize — so the player isn't sent through the browser
   * every time. Omit for no persistence (re-auth each launch). A cross-platform
   * OS-keychain backend ships at `@discordkit/native/auth/keyring`. See {@link TokenStore}.
   */
  tokenStore?: TokenStore;
}

// `Subscription` + `toSubscription` live in their own koffi-free module so
// reactive/webview consumers don't pull the FFI backend; re-exported here so the
// public API (import from `@discordkit/native`) is unchanged.
export { toSubscription, type Subscription } from "./subscription.js";

/**
 * A live client over one native `Discord_Client` handle. Created by
 * {@link createClient}; also `using`-disposable (drops the handle, stops the
 * pump, unregisters callbacks at scope exit). Feature operations (`setActivity`,
 * `authorize`, …) live in subpath modules and operate on this via its internal
 * `lib`/`handle`, binding their own C functions lazily so importing one feature
 * never pulls in another.
 */
export interface DiscordClient extends Disposable {
  /** Always-current connection status, as a TC39 `Signal.State`. */
  readonly status: Signal.State<Status>;
  /** Subscribe to log lines. Returns an unsubscribe / `Disposable`. */
  onLog: (handler: (entry: LogEntry) => void) => Subscription;
  /** Explicitly tear down: drop the handle, stop the pump, unregister callbacks. */
  close: () => void;

  /** @internal The opened FFI library (feature modules bind their fns off this). */
  readonly lib: FfiLibrary;
  /** @internal Pointer to the `Discord_Client` opaque handle. */
  readonly handle: FfiOpaque;
  /** @internal Resolved application ID for token/auth calls. */
  readonly applicationId: bigint;
  /** @internal The configured token store (session persistence), if any. */
  readonly tokenStore?: TokenStore;
  /** @internal Register a callback handle to be unregistered on close. */
  trackCallback: (handle: FfiOpaque) => void;
}

const resolveApplicationId = (config: ClientConfig): bigint => {
  const raw = config.applicationId ?? process.env.DISCORD_APPLICATION_ID;
  if (raw === undefined || raw === ``) {
    throw new Error(
      `A Discord application ID is required. Pass \`applicationId\` to ` +
        `init/createClient or set DISCORD_APPLICATION_ID.`
    );
  }
  try {
    return BigInt(raw);
  } catch {
    throw new Error(`Invalid Discord application ID: ${String(raw)}`);
  }
};

/**
 * A live client over one native `Discord_Client` handle — the consumer-owned
 * resource at the center of the package, so it's a class (with `#private` state
 * and `[Symbol.dispose]`) rather than a factory-returned object. Feature
 * operations are deliberately NOT methods here: they stay free functions in
 * subpath modules that take a client, so importing one feature never pulls in
 * another (the tree-shaking boundary). Methods are arrow-bound so destructuring
 * (`const { close } = client`) keeps working.
 *
 * Prefer the {@link createClient} factory (or the ambient {@link init}); the
 * class is exported as the implementation type. `using client = createClient(...)`
 * auto-disposes (drops the handle, stops the pump, unregisters callbacks).
 */
class DiscordClientImpl implements DiscordClient {
  readonly status = new Signal.State<Status>(`disconnected`);
  readonly lib: FfiLibrary;
  readonly handle: FfiOpaque;
  readonly applicationId: bigint;
  readonly tokenStore?: TokenStore;

  #closed = false;
  readonly #pump: ReturnType<typeof setInterval>;
  readonly #registered: FfiOpaque[] = [];
  readonly #logHandlers = new Set<(entry: LogEntry) => void>();
  readonly #drop: (handle: FfiOpaque) => unknown;

  constructor(config: ClientConfig) {
    // The default (Koffi) backend needs a resolved per-platform library file; a
    // custom backend (tests, a future node:ffi/remote backend) interprets the
    // raw `libraryPath` itself, so we don't impose our path probing on it.
    const backend = config.backend ?? koffiBackend;
    const libraryPath = config.backend
      ? (config.libraryPath ?? ``)
      : resolveLibraryPath({ libraryPath: config.libraryPath });
    const lib = backend(libraryPath);
    this.lib = lib;
    this.applicationId = resolveApplicationId(config);
    this.tokenStore = config.tokenStore;

    // --- lifecycle + status bindings (every consumer needs these) ---
    const init = lib.func(/* C */ `void Discord_Client_Init(void *self)`);
    this.#drop = lib.func(/* C */ `void Discord_Client_Drop(void *self)`);
    const setAppId = lib.func(
      /* C */ `void Discord_Client_SetApplicationId(void *self, uint64_t applicationId)`
    );
    const setStatusCb = lib.func(
      /* C */ `void Discord_Client_SetStatusChangedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`
    );
    const addLogCb = lib.func(
      /* C */ `void Discord_Client_AddLogCallback(void *self, void *cb, void *cbFree, void *cbUserData, int minSeverity)`
    );
    const runCallbacks = lib.func(/* C */ `void Discord_RunCallbacks()`);

    const OnStatusChanged = lib.defineCallback(
      /* C */ `void OnStatusChanged(int status, int error, int32_t errorDetail, void *userData)`
    );
    const LogCallback = lib.defineCallback(
      /* C */ `void LogCallback(Discord_String message, int severity, void *userData)`
    );

    // --- allocate + init the opaque handle ---
    this.handle = lib.allocHandle();
    init(this.handle);
    setAppId(this.handle, this.applicationId);

    // --- status signal + log stream, driven by the SDK's persistent callbacks ---
    const statusCb = lib.registerCallback(OnStatusChanged, (code: number) => {
      this.status.set(STATUS_BY_CODE[code] ?? `disconnected`);
    });
    const logCb = lib.registerCallback(
      LogCallback,
      (message: unknown, severity: number) => {
        const entry: LogEntry = {
          message: lib.decodeString(message),
          severity: LOG_SEVERITY_BY_CODE[severity] ?? `info`
        };
        for (const handler of this.#logHandlers) handler(entry);
      }
    );
    this.#registered.push(statusCb, logCb);

    // callback triple: (cb, cbFree=null, cbUserData=null) — JS owns lifetime.
    setStatusCb(this.handle, statusCb, null, null);
    addLogCb(
      this.handle,
      logCb,
      null,
      null,
      LOG_SEVERITY_CODE[config.minLogSeverity ?? `info`]
    );

    // --- pump on the main thread ---
    this.#pump = setInterval(() => {
      runCallbacks();
    }, config.pumpIntervalMs ?? 16);
    // NB: do NOT `unref()` the pump. It is essential, continuous work — draining
    // SDK events and firing callbacks. If it's `unref`'d and the pump is the
    // only active handle (headless Node, the Tauri sidecar, tests), Node stops
    // running the timer and ALL SDK callbacks stall (presence never acks).
    // Keeping it ref'd means an active client keeps the process alive — which is
    // correct; call `close()`/`shutdown()` to stop the pump and let it exit.
  }

  onLog = (handler: (entry: LogEntry) => void): Subscription => {
    this.#logHandlers.add(handler);
    const unsubscribe = (): void => {
      this.#logHandlers.delete(handler);
    };
    return Object.assign(unsubscribe, {
      [Symbol.dispose]: unsubscribe
    }) as Subscription;
  };

  close = (): void => {
    if (this.#closed) return;
    this.#closed = true;
    clearInterval(this.#pump);
    this.#drop(this.handle);
    for (const cb of this.#registered) this.lib.unregisterCallback(cb);
    this.#logHandlers.clear();
  };

  trackCallback = (cbHandle: FfiOpaque): void => {
    this.#registered.push(cbHandle);
  };

  [Symbol.dispose] = (): void => this.close();
}

/**
 * Create a client over its own native `Discord_Client` handle. The low-level
 * primitive behind the ambient singleton; use directly for multi-client or
 * test scenarios. `using client = createClient(...)` auto-disposes at scope exit.
 */
export const createClient = (config: ClientConfig = {}): DiscordClient =>
  new DiscordClientImpl(config);
