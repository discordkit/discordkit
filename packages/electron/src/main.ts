import {
  init,
  subscribe,
  shutdown,
  type ClientConfig,
  type Status
} from "@discordkit/native";
import { authorize } from "@discordkit/native/auth";
import { setActivity, clearActivity } from "@discordkit/native/presence";
import {
  CHANNELS,
  type ConnectMessage,
  type ActivityMessage
} from "./channels.js";

/**
 * Minimal slices of Electron's main-process API we depend on, declared
 * structurally so the package doesn't hard-import `electron` (it's a peer, and
 * this keeps the types available without forcing the dependency at type-check).
 */
interface IpcMainLike {
  handle: (
    channel: string,
    listener: (event: unknown, ...args: any[]) => unknown
  ) => void;
}
interface WebContentsLike {
  send: (channel: string, ...args: any[]) => void;
  isDestroyed: () => boolean;
}

/** Options for {@link registerDiscord}. */
export interface RegisterDiscordOptions extends ClientConfig {
  /**
   * The renderer targets that should receive status/log events. Pass your
   * windows' `webContents` (e.g. `[mainWindow.webContents]`). You can also add
   * more later via the returned handle's `addTarget`.
   */
  targets?: WebContentsLike[];
}

/** Handle returned by {@link registerDiscord} for lifecycle control. */
export interface DiscordMainHandle {
  /** Add another renderer target to receive events. */
  addTarget: (target: WebContentsLike) => void;
  /** Tear down the client (stops the pump, drops the handle). */
  dispose: () => void;
}

/**
 * Wire the Discord Social SDK (running in this main process) to IPC, so a
 * renderer using the preload bridge can drive it. Call once during app startup,
 * after `app.whenReady()`, passing your `ipcMain` and window `webContents`.
 *
 * The SDK's ambient singleton is activated here; the renderer never touches FFI.
 */
export const registerDiscord = (
  ipcMain: IpcMainLike,
  options: RegisterDiscordOptions = {}
): DiscordMainHandle => {
  const { targets = [], ...config } = options;
  const client = init(config);

  const sinks = new Set<WebContentsLike>(targets);
  const broadcast = (channel: string, payload: unknown): void => {
    for (const sink of sinks) {
      if (!sink.isDestroyed()) sink.send(channel, payload);
    }
  };

  // Forward the status signal + log stream to every renderer target.
  const statusSub = subscribe(client.status, (status: Status) => {
    broadcast(CHANNELS.status, status);
  });
  const logSub = client.onLog((entry) => {
    broadcast(CHANNELS.log, entry);
  });

  ipcMain.handle(CHANNELS.connect, async (_event, message?: ConnectMessage) => {
    await authorize({ scopes: message?.scopes ?? `presence` });
  });
  ipcMain.handle(
    CHANNELS.setActivity,
    async (_event, input: ActivityMessage) => {
      await setActivity(input);
    }
  );
  ipcMain.handle(CHANNELS.clearActivity, async () => {
    await clearActivity();
  });
  ipcMain.handle(CHANNELS.getStatus, () => client.status.get());

  return {
    addTarget: (target) => {
      sinks.add(target);
    },
    dispose: () => {
      statusSub();
      logSub();
      shutdown();
    }
  };
};
