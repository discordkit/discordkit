import { Signal } from "signal-polyfill";
import { koffiBackend } from "./ffi/koffi-backend.js";
import type { FfiBackend, FfiLibrary, FfiOpaque } from "./ffi/backend.js";
import { resolveLibraryPath } from "./resolveLibrary.js";
import {
  LOG_SEVERITY,
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
  /** Minimum log severity to deliver to {@link DiscordClient.onLog}. Default `Info`. */
  minLogSeverity?: keyof typeof LOG_SEVERITY;
  /**
   * How often (ms) to pump `Discord_RunCallbacks`. Default 16ms (~60Hz). The
   * pump runs on the main thread; callbacks fire synchronously inside it.
   */
  pumpIntervalMs?: number;
  /** FFI backend. Defaults to Koffi; injectable for tests / future node:ffi. */
  backend?: FfiBackend;
}

/** Unsubscribe handle that is also a {@link Disposable} for `using`. */
export type Subscription = (() => void) & Disposable;

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
 * Create a client over its own native `Discord_Client` handle. The low-level
 * primitive behind the ambient singleton; use directly for multi-client or
 * test scenarios. `using client = createClient(...)` auto-disposes at scope exit.
 */
export const createClient = (config: ClientConfig = {}): DiscordClient => {
  // The default (Koffi) backend needs a resolved per-platform library file; a
  // custom backend (tests, a future node:ffi/remote backend) interprets the raw
  // `libraryPath` itself, so we don't impose our path probing on it.
  const backend = config.backend ?? koffiBackend;
  const libraryPath = config.backend
    ? (config.libraryPath ?? ``)
    : resolveLibraryPath({ libraryPath: config.libraryPath });
  const lib = backend(libraryPath);
  const applicationId = resolveApplicationId(config);

  // --- lifecycle + status bindings (every consumer needs these) ---
  const init = lib.func(`void Discord_Client_Init(void *self)`);
  const drop = lib.func(`void Discord_Client_Drop(void *self)`);
  const setAppId = lib.func(
    `void Discord_Client_SetApplicationId(void *self, uint64_t applicationId)`
  );
  const setStatusCb = lib.func(
    `void Discord_Client_SetStatusChangedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`
  );
  const addLogCb = lib.func(
    `void Discord_Client_AddLogCallback(void *self, void *cb, void *cbFree, void *cbUserData, int minSeverity)`
  );
  const runCallbacks = lib.func(`void Discord_RunCallbacks()`);

  const OnStatusChanged = lib.defineCallback(
    `void OnStatusChanged(int status, int error, int32_t errorDetail, void *userData)`
  );
  const LogCallback = lib.defineCallback(
    `void LogCallback(Discord_String message, int severity, void *userData)`
  );

  // --- allocate + init the opaque handle ---
  const handle = lib.allocHandle();
  init(handle);
  setAppId(handle, applicationId);

  // --- status signal, driven by the SDK's persistent status callback ---
  const status = new Signal.State<Status>(`Disconnected`);
  const logHandlers = new Set<(entry: LogEntry) => void>();
  const registered: FfiOpaque[] = [];

  const statusCb = lib.registerCallback(OnStatusChanged, (code: number) => {
    status.set(STATUS_BY_CODE[code] ?? `Disconnected`);
  });
  const logCb = lib.registerCallback(
    LogCallback,
    (message: unknown, severity: number) => {
      const entry: LogEntry = {
        message: lib.decodeString(message),
        severity: LOG_SEVERITY_BY_CODE[severity] ?? `Info`
      };
      for (const handler of logHandlers) handler(entry);
    }
  );
  registered.push(statusCb, logCb);

  // callback triple: (cb, cbFree=null, cbUserData=null) — JS owns lifetime.
  setStatusCb(handle, statusCb, null, null);
  addLogCb(
    handle,
    logCb,
    null,
    null,
    LOG_SEVERITY[config.minLogSeverity ?? `Info`]
  );

  // --- pump on the main thread ---
  const interval = config.pumpIntervalMs ?? 16;
  const pump = setInterval(() => {
    runCallbacks();
  }, interval);
  // Don't keep the process alive solely for the pump.
  pump.unref();

  let closed = false;
  const close = (): void => {
    if (closed) return;
    closed = true;
    clearInterval(pump);
    drop(handle);
    for (const cb of registered) lib.unregisterCallback(cb);
    logHandlers.clear();
  };

  return {
    status,
    onLog: (handler) => {
      logHandlers.add(handler);
      const unsubscribe = (): void => {
        logHandlers.delete(handler);
      };
      return Object.assign(unsubscribe, {
        [Symbol.dispose]: unsubscribe
      }) as Subscription;
    },
    close,
    lib,
    handle,
    applicationId,
    trackCallback: (cbHandle) => {
      registered.push(cbHandle);
    },
    [Symbol.dispose]: close
  };
};
