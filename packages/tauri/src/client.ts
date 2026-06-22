import type {
  ActivityInput,
  ActivityBuilder
} from "@discordkit/native/presence";
import { CORE_CHANNELS, type CoreBridge } from "./channels/core.js";
import {
  bridgeIo,
  eventRouter,
  EVENT_SINK,
  type BridgeIo,
  type RemoteApi
} from "./internal.js";

/**
 * The CORE webview client — presence, auth, status, log. This is the Tauri
 * counterpart to `@discordkit/electron`'s preload bridge: it builds the bridge
 * object the webview calls. Importing this pulls in no feature domain; compose
 * feature namespaces by passing their slice factories (from
 * `@discordkit/tauri/client/<domain>`) to {@link createClient}.
 *
 * Unlike Electron (where the preload is a separate context and the renderer just
 * reads `window.discord`), in Tauri the webview itself owns the kkrpc connection
 * to the sidecar — so `createClient` both establishes the connection and returns
 * the typed bridge.
 */

/** A domain client slice: given the shared {@link BridgeIo}, return the namespace
 * object to merge onto the bridge (e.g. `{ users: { … } }`). Each domain's slice
 * factory lives in `@discordkit/tauri/client/<domain>`. */
export type BridgeSlice = (io: BridgeIo) => Record<string, unknown>;

/** Normalize the builder-callback form to a plain object (functions can't cross RPC). */
const toActivity = (
  input: ActivityInput | ((builder: ActivityBuilder) => void)
): ActivityInput => {
  if (typeof input !== `function`) return input;
  const builder: ActivityBuilder = { type: `playing` };
  input(builder);
  return builder;
};

/** Build the core bridge (presence/auth/status/log) over one {@link BridgeIo}. */
export const createCoreBridge = (io: BridgeIo): CoreBridge => {
  const core: CoreBridge = {
    connect: async (message) => io.call(CORE_CHANNELS.connect, message),
    logout: async () => io.call(CORE_CHANNELS.logout),
    setActivity: async (input) =>
      io.call(CORE_CHANNELS.setActivity, toActivity(input)),
    clearActivity: async () => io.call(CORE_CHANNELS.clearActivity),
    getStatus: async () => io.call(CORE_CHANNELS.getStatus),
    onStatus: (handler) => io.on(CORE_CHANNELS.status, handler),
    onLog: (handler) => io.on(CORE_CHANNELS.log, handler)
  };
  return core;
};

/**
 * The kkrpc connection a {@link createClient} call needs — abstracted so the
 * package doesn't hard-import `@tauri-apps/*` or `kkrpc/browser` (keeping those a
 * peer dep + the transport out of the core graph). `connect` returns a remote API
 * proxy bound to a sidecar, given the local API the webview exposes back. The
 * default `tauriSidecarConnection` provides the real Tauri+kkrpc wiring.
 */
export type SidecarConnection = (localApi: Record<string, unknown>) => Promise<{
  remote: RemoteApi;
  /** Tear down the channel + kill the sidecar process. */
  close: () => void | Promise<void>;
}>;

/**
 * Thrown when the sidecar process dies during startup (e.g. the Discord SDK
 * library is missing, the library path is wrong, or the App ID is unset) — before
 * it can answer RPC. `stderr` carries what the sidecar wrote to its error stream,
 * which is where `@discordkit/native` puts its actionable "couldn't locate the
 * SDK…" guidance. Surface `stderr` to the user rather than letting the first RPC
 * call hang until it times out.
 */
export class SidecarStartupError extends Error {
  readonly stderr: string;
  constructor(message: string, stderr: string) {
    super(stderr.trim() ? `${message}\n\n${stderr.trim()}` : message);
    this.name = `SidecarStartupError`;
    this.stderr = stderr;
  }
}

/** The composed webview bridge: the core surface plus whatever slices were passed. */
export type Client<S extends BridgeSlice[]> = CoreBridge &
  UnionToIntersection<ReturnType<S[number]>> & {
    /** Tear down the bridge: closes the RPC channel and stops the sidecar. */
    close: () => Promise<void>;
  };

// Merge the slice return types into one object type (e.g. `{users:…} & {voice:…}`).
type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Establish the connection to the Discord sidecar and build the webview bridge.
 * The core surface (presence/auth/status/log) is always present; pass feature
 * slices to add their namespaces — only the slices you pass are bundled:
 *
 * ```ts
 * import { createClient } from "@discordkit/tauri/client";
 * import { usersSlice } from "@discordkit/tauri/client/users";
 * const discord = await createClient([usersSlice]);
 * await discord.connect();
 * const me = await discord.users.getCurrent();
 * using off = discord.onStatus((s) => render(s));
 * ```
 *
 * @param slices the domain slices to compose onto the bridge.
 * @param options.connect the sidecar connection; defaults to the real Tauri+kkrpc
 *   wiring (`tauriSidecarConnection`). Tests pass a fake to drive in-memory.
 * @param options.expose extra methods the webview exposes to the sidecar (reverse
 *   RPC) — e.g. `keyringRelay(...)` so the sidecar's token store can reach the OS
 *   keychain. Merged alongside the event sink.
 */
export const createClient = async <S extends BridgeSlice[]>(
  slices: S = [] as unknown as S,
  options: {
    connect?: SidecarConnection;
    // Dynamically-typed RPC methods (like the HandlerMap on the sidecar side); a
    // caller passes a typed record (e.g. KeyringRelay) which is structurally fine.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expose?: Record<string, (...args: any[]) => unknown>;
  } = {}
): Promise<Client<S>> => {
  const connect = options.connect ?? tauriSidecarConnection();
  const router = eventRouter();
  const localApi = { ...router.localApi, ...options.expose };
  const { remote, close } = await connect(localApi);
  const io = bridgeIo(remote, router);
  const bridge = Object.assign(
    createCoreBridge(io),
    ...slices.map((slice) => slice(io)),
    { close: async () => close() }
  );
  return bridge as Client<S>;
};

/**
 * The real connection: spawn the sidecar via Tauri's shell plugin and wire kkrpc
 * over its stdio. Imported lazily so `@tauri-apps/*` + `kkrpc/tauri` stay out of
 * the core module graph until an app actually connects (and tests can inject a
 * fake without them installed).
 *
 * @param binary the sidecar name registered in `tauri.conf` `externalBin`. Must
 *   match an `externalBin` entry exactly, including the `binaries/` path prefix —
 *   Tauri's `Command.sidecar` matches by the configured string, not the bare name.
 *   Defaults to `"binaries/discord-sidecar"` (the name the package's shipped
 *   `tauri/capabilities.json` grants).
 */
export const tauriSidecarConnection =
  (binary = `binaries/discord-sidecar`): SidecarConnection =>
  async (localApi) => {
    // kkrpc v2: `RPCChannel` from the main entry; the Tauri stdio transport is a
    // factory (`tauriShellStdioTransport({ stdout, child })`) from `kkrpc/tauri`,
    // not the old `TauriShellStdio` class (the published docs lag the v2 API).
    const [{ Command }, { RPCChannel }, { tauriShellStdioTransport }] =
      await Promise.all([
        import(`@tauri-apps/plugin-shell`),
        import(`kkrpc`),
        import(`kkrpc/tauri`)
      ]);
    const command = Command.sidecar(binary);

    // Capture stderr + watch for an early exit so a sidecar that dies during
    // startup (missing SDK, bad path, unset App ID) surfaces a clear error
    // instead of a hung first RPC. `@discordkit/native` writes its actionable
    // guidance to stderr, so we relay that verbatim.
    let stderr = ``;
    let exited: { code: number | null } | undefined;
    const exitWaiters = new Set<(value: { code: number | null }) => void>();
    command.stderr.on(`data`, (line: string) => {
      stderr += line;
    });
    command.on(`close`, (data: { code: number | null }) => {
      exited = data;
      for (const resolve of exitWaiters) resolve(data);
    });

    const child = await command.spawn();
    const transport = tauriShellStdioTransport({
      stdout: command.stdout,
      child
    });
    const channel = new RPCChannel(transport, { expose: localApi });
    const remote = channel.getAPI() as RemoteApi;

    // Wrap remote calls so the FIRST awaited call rejects immediately if the
    // sidecar has already exited (or exits while the call is in flight), rather
    // than waiting out kkrpc's RPC timeout.
    const guardedRemote = guardRemote(remote, {
      hasExited: () => exited,
      onExit: (resolve) => {
        exitWaiters.add(resolve);
        return (): boolean => exitWaiters.delete(resolve);
      },
      stderr: () => stderr
    });

    return {
      remote: guardedRemote,
      close: async () => {
        channel.destroy();
        await child.kill();
      }
    };
  };

/**
 * Wrap the kkrpc remote proxy so each method races the RPC against the sidecar
 * process exiting. If the process is already dead (or dies mid-call), reject with
 * a {@link SidecarStartupError} carrying its stderr — turning a 30s hang into an
 * immediate, actionable failure.
 */
const guardRemote = (
  remote: RemoteApi,
  process: {
    hasExited: () => { code: number | null } | undefined;
    onExit: (resolve: (value: { code: number | null }) => void) => () => void;
    stderr: () => string;
  }
): RemoteApi => {
  const fail = (code: number | null): SidecarStartupError =>
    new SidecarStartupError(
      `The Discord sidecar exited (code ${code ?? `unknown`}) before it could ` +
        `respond. It usually means the Discord Social SDK couldn't be loaded.`,
      process.stderr()
    );
  // The remote API is a FLAT record of channel methods (`remote[channel](...)`),
  // so guard each function-valued property directly.
  return new Proxy(remote, {
    get: (obj, key) => {
      const value = (obj as Record<string | symbol, unknown>)[key];
      if (typeof value !== `function`) return value;
      return async (...args: unknown[]): Promise<unknown> => {
        const dead = process.hasExited();
        if (dead) throw fail(dead.code);
        let off: (() => void) | undefined;
        const exitRace = new Promise<never>((_resolve, reject) => {
          off = process.onExit((data) => reject(fail(data.code)));
        });
        try {
          return await Promise.race([
            (value as (...a: unknown[]) => unknown).apply(obj, args),
            exitRace
          ]);
        } finally {
          off?.();
        }
      };
    }
  });
};
