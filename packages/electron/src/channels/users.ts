/** The users domain's IPC contract. Mirrors `@discordkit/native/users`. */
import type { User } from "@discordkit/native/users";

export const USER_CHANNELS = {
  getCurrent: `discordkit:users:getCurrent`,
  get: `discordkit:users:get`
} as const;

/** The `window.discord.users` namespace. */
export interface UsersBridge {
  /** Read the current user, or `undefined` before auth/connect. */
  getCurrent: () => Promise<User | undefined>;
  /** Read a cached user by id, or `undefined` if not cached. */
  get: (userId: bigint) => Promise<User | undefined>;
}
