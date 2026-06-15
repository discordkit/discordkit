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
  CORE_CHANNELS,
  type ConnectMessage,
  type ActivityMessage
} from "./channels/core.js";
import type {
  IpcMainLike,
  RegisterContext,
  WebContentsLike
} from "./internal.js";

/**
 * The CORE main-process registration — lifecycle, presence, auth, status, log.
 * Importing this pulls in ONLY the presence + auth native subpaths, never the
 * feature domains (users/relationships/lobbies/messaging/voice). Add a domain by
 * importing its registrar from `@discordkit/electron/main/<domain>` and calling
 * it with the {@link DiscordMainHandle.context} returned here — so an app's main
 * bundle contains exactly the native code for the domains it actually wires.
 */

/** Options for {@link registerDiscord}. */
export interface RegisterDiscordOptions extends ClientConfig {
  /**
   * The renderer targets that should receive status/log/event broadcasts. Pass
   * your windows' `webContents` (e.g. `[mainWindow.webContents]`). Add more later
   * via the returned handle's `addTarget`.
   */
  targets?: WebContentsLike[];
}

/** Handle returned by {@link registerDiscord} for lifecycle + domain composition. */
export interface DiscordMainHandle {
  /** Add another renderer target to receive events. */
  addTarget: (target: WebContentsLike) => void;
  /**
   * The registration context to pass to per-domain registrars, e.g.
   * `registerLobbies(handle.context)`. Lets each domain wire its handlers +
   * broadcasts without importing the core or a sibling domain.
   */
  readonly context: RegisterContext;
  /** Tear down the client (stops the pump, drops the handle, unsubscribes all). */
  dispose: () => void;
}

/**
 * Wire the Discord Social SDK (running in this main process) to IPC, so a
 * renderer using the preload bridge can drive it. Call once during app startup,
 * after `app.whenReady()`, passing your `ipcMain` and window `webContents`.
 *
 * This registers the core (presence/auth/status/log). For the feature domains,
 * call their registrars with the returned `context`:
 *
 * ```ts
 * import { registerDiscord } from "@discordkit/electron/main";
 * import { registerLobbies } from "@discordkit/electron/main/lobbies";
 * const discord = registerDiscord(ipcMain, { targets: [win.webContents] });
 * registerLobbies(discord.context); // only now is the lobbies native code bundled
 * ```
 */
export const registerDiscord = (
  ipcMain: IpcMainLike,
  options: RegisterDiscordOptions = {}
): DiscordMainHandle => {
  const { targets = [], ...config } = options;
  const client = init(config);

  const sinks = new Set<WebContentsLike>(targets);
  const broadcast = (channel: string, ...payload: unknown[]): void => {
    for (const sink of sinks) {
      if (!sink.isDestroyed()) sink.send(channel, ...payload);
    }
  };

  const subs: Array<() => void> = [
    subscribe(client.status, (status: Status) =>
      broadcast(CORE_CHANNELS.status, status)
    ),
    client.onLog((entry) => broadcast(CORE_CHANNELS.log, entry))
  ];

  const handle = ipcMain.handle.bind(ipcMain);
  handle(CORE_CHANNELS.connect, async (_e, message?: ConnectMessage) => {
    await authorize({ scopes: message?.scopes ?? `presence` });
  });
  handle(CORE_CHANNELS.setActivity, async (_e, input: ActivityMessage) => {
    await setActivity(input);
  });
  handle(CORE_CHANNELS.clearActivity, () => clearActivity());
  handle(CORE_CHANNELS.getStatus, () => client.status.get());

  const context: RegisterContext = {
    handle,
    broadcast,
    track: (off) => subs.push(off)
  };

  return {
    addTarget: (target) => {
      sinks.add(target);
    },
    context,
    dispose: () => {
      for (const off of subs) off();
      shutdown();
    }
  };
};
