import type {
  ActivityInput,
  ActivityBuilder
} from "@discordkit/native/presence";
import { CORE_CHANNELS, type CoreBridge } from "./channels/core.js";
import { bridgeIo, type BridgeIo, type IpcRendererLike } from "./internal.js";

/**
 * The CORE preload bridge — presence, auth, status, log. Importing this pulls in
 * no feature domain. Compose feature namespaces by passing their slice factories
 * (from `@discordkit/electron/preload/<domain>`) to {@link exposeDiscord}.
 */

interface ContextBridgeLike {
  exposeInMainWorld: (key: string, api: unknown) => void;
}

/**
 * A domain bridge slice: given the shared {@link BridgeIo}, return the namespace
 * object to merge onto `window.discord` (e.g. `{ users: { … } }`). Each domain's
 * slice factory lives in `@discordkit/electron/preload/<domain>`.
 */
export type BridgeSlice = (io: BridgeIo) => Record<string, unknown>;

/** Normalize the builder-callback form to a plain object (functions can't cross IPC). */
const toActivity = (
  input: ActivityInput | ((builder: ActivityBuilder) => void)
): ActivityInput => {
  if (typeof input !== `function`) return input;
  const builder: ActivityBuilder = { type: `playing` };
  input(builder);
  return builder;
};

/** Build the core bridge (presence/auth/status/log) for one `ipcRenderer`. */
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
 * Expose the Discord bridge on `window.discord` in the renderer. The core
 * surface is always present; pass feature-domain slices to add their namespaces:
 *
 * ```ts
 * import { contextBridge, ipcRenderer } from "electron";
 * import { exposeDiscord } from "@discordkit/electron/preload";
 * import { usersSlice } from "@discordkit/electron/preload/users";
 * exposeDiscord(contextBridge, ipcRenderer, [usersSlice]);
 * // window.discord.connect(...) AND window.discord.users.getCurrent()
 * ```
 *
 * Only the slices you pass are bundled into the preload + present on the bridge.
 *
 * @param key the global key to expose on; defaults to `"discord"`.
 */
export const exposeDiscord = (
  contextBridge: ContextBridgeLike,
  ipcRenderer: IpcRendererLike,
  slices: BridgeSlice[] = [],
  key = `discord`
): void => {
  const io = bridgeIo(ipcRenderer);
  const bridge = Object.assign(
    createCoreBridge(io),
    ...slices.map((slice) => slice(io))
  );
  contextBridge.exposeInMainWorld(key, bridge);
};
