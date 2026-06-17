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
 * @param connect the sidecar connection; defaults to the real Tauri+kkrpc wiring
 *   (`tauriSidecarConnection`). Tests pass a fake to drive the bridge in-memory.
 */
export const createClient = async <S extends BridgeSlice[]>(
  slices: S = [] as unknown as S,
  connect: SidecarConnection = tauriSidecarConnection()
): Promise<Client<S>> => {
  const router = eventRouter();
  const { remote, close } = await connect(router.localApi);
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
 * @param binary the sidecar binary name registered in `tauri.conf` `externalBin`;
 *   defaults to `"discord-sidecar"`.
 */
export const tauriSidecarConnection =
  (binary = `discord-sidecar`): SidecarConnection =>
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
    const child = await command.spawn();
    const transport = tauriShellStdioTransport({
      stdout: command.stdout,
      child
    });
    const channel = new RPCChannel(transport, { expose: localApi });
    return {
      remote: channel.getAPI() as RemoteApi,
      close: async () => {
        channel.destroy();
        await child.kill();
      }
    };
  };
