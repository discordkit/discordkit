/** The users domain's bridge contract. Mirrors `@discordkit/native/users`. */
import type { User } from "@discordkit/native/users";
import type { Wire, WireUserId } from "../wire.js";

export const USER_CHANNELS = {
  getCurrent: `discordkit:users:getCurrent`,
  get: `discordkit:users:get`
} as const;

/** The `users` namespace on the webview bridge. */
export interface UsersBridge {
  /** Read the current user, or `undefined` before auth/connect. */
  getCurrent: () => Promise<Wire<User> | undefined>;
  /** Read a cached user by id, or `undefined` if not cached. */
  get: (userId: WireUserId) => Promise<Wire<User> | undefined>;
}
