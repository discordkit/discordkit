/** The users domain's bridge contract. Mirrors `@discordkit/native/users`. */
import type { User } from "@discordkit/native/users";
import type { UserId } from "@discordkit/native";

export const USER_CHANNELS = {
  getCurrent: `discordkit:users:getCurrent`,
  get: `discordkit:users:get`
} as const;

/** The `users` namespace on the webview bridge. */
export interface UsersBridge {
  /** Read the current user, or `undefined` before auth/connect. */
  getCurrent: () => Promise<User | undefined>;
  /** Read a cached user by id, or `undefined` if not cached. */
  get: (userId: UserId) => Promise<User | undefined>;
}
