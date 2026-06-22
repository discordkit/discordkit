import type { UserId } from "@discordkit/native";
import { getCurrentUser, getUser } from "@discordkit/native/users";
import { USER_CHANNELS } from "../channels/users.js";
import type { RegisterContext } from "../internal.js";

/**
 * Wire the users domain's IPC handlers. Call with the context from
 * `registerDiscord`. Imports ONLY `@discordkit/native/users`, so an app that
 * doesn't call this bundles none of the users native code.
 *
 * ```ts
 * const discord = registerDiscord(ipcMain, opts);
 * registerUsers(discord.context);
 * ```
 */
export const registerUsers = ({ handle }: RegisterContext): void => {
  handle(USER_CHANNELS.getCurrent, () => getCurrentUser());
  handle(USER_CHANNELS.get, (_e, userId: UserId) => getUser(userId));
};
