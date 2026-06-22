import { USER_CHANNELS, type UsersBridge } from "../channels/users.js";
import type { BridgeIo } from "../internal.js";

/**
 * The users client slice. Pass to `createClient([usersSlice])` to add the `users`
 * namespace to the webview bridge. Imports only the users channel contract
 * (type-only), so it adds no native code to the webview bundle.
 */
export const usersSlice = (io: BridgeIo): { users: UsersBridge } => {
  const users: UsersBridge = {
    getCurrent: async () => io.call(USER_CHANNELS.getCurrent),
    get: async (userId) => io.call(USER_CHANNELS.get, userId)
  };
  return { users };
};
