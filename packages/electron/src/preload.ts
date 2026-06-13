import type {
  ActivityInput,
  ActivityBuilder
} from "@discordkit/native/presence";
import { CHANNELS, type DiscordBridge } from "./channels.js";

/**
 * Minimal slices of Electron's preload API we use, declared structurally so the
 * package doesn't hard-import `electron` (peer dependency).
 */
interface ContextBridgeLike {
  exposeInMainWorld: (key: string, api: unknown) => void;
}
interface IpcRendererLike {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  on: (
    channel: string,
    listener: (event: unknown, ...args: any[]) => void
  ) => void;
  removeListener: (
    channel: string,
    listener: (event: unknown, ...args: any[]) => void
  ) => void;
}

/** Normalize the builder-callback form to a plain object (functions can't cross IPC). */
const toActivity = (
  input: ActivityInput | ((builder: ActivityBuilder) => void)
): ActivityInput => {
  if (typeof input !== `function`) return input;
  const builder: ActivityBuilder = { type: `playing` };
  input(builder);
  return builder;
};

/**
 * Build the {@link DiscordBridge} that the renderer sees as `window.discord`.
 * Exposed separately from {@link exposeDiscord} so consumers who manage their
 * own `contextBridge` key can compose it.
 */
export const createDiscordBridge = (
  ipcRenderer: IpcRendererLike
): DiscordBridge => ({
  connect: async (message) =>
    ipcRenderer.invoke(CHANNELS.connect, message) as Promise<void>,
  setActivity: async (input) =>
    ipcRenderer.invoke(
      CHANNELS.setActivity,
      toActivity(input)
    ) as Promise<void>,
  clearActivity: async () =>
    ipcRenderer.invoke(CHANNELS.clearActivity) as Promise<void>,
  getStatus: async () =>
    ipcRenderer.invoke(CHANNELS.getStatus) as ReturnType<
      DiscordBridge[`getStatus`]
    >,
  onStatus: (handler) => {
    const listener = (_event: unknown, status: unknown): void => {
      handler(status as Parameters<typeof handler>[0]);
    };
    ipcRenderer.on(CHANNELS.status, listener);
    return () => {
      ipcRenderer.removeListener(CHANNELS.status, listener);
    };
  },
  onLog: (handler) => {
    const listener = (_event: unknown, entry: unknown): void => {
      handler(entry as Parameters<typeof handler>[0]);
    };
    ipcRenderer.on(CHANNELS.log, listener);
    return () => {
      ipcRenderer.removeListener(CHANNELS.log, listener);
    };
  }
});

/**
 * Expose the Discord bridge on `window.discord` in the renderer. Call this from
 * your preload script, passing Electron's `contextBridge` and `ipcRenderer`:
 *
 * ```ts
 * import { contextBridge, ipcRenderer } from "electron";
 * import { exposeDiscord } from "@discordkit/electron/preload";
 * exposeDiscord(contextBridge, ipcRenderer);
 * ```
 *
 * @param key the global key to expose on; defaults to `"discord"`.
 */
export const exposeDiscord = (
  contextBridge: ContextBridgeLike,
  ipcRenderer: IpcRendererLike,
  key = `discord`
): void => {
  contextBridge.exposeInMainWorld(key, createDiscordBridge(ipcRenderer));
};
