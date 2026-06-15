import { USER_CHANNELS, type UsersBridge } from "../channels/users.js";
import type { BridgeIo } from "../internal.js";

/**
 * The users preload slice. Pass to `exposeDiscord(cb, ipc, [usersSlice])` to add
 * `window.discord.users`. Imports only the users channel contract (type-only).
 */
export const usersSlice = (io: BridgeIo): { users: UsersBridge } => ({
  users: {
    getCurrent: async () => io.call(USER_CHANNELS.getCurrent),
    get: async (userId) => io.call(USER_CHANNELS.get, userId)
  }
});
