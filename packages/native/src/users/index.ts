/**
 * Users — the public surface of `@discordkit/native/users`.
 *
 * Read-only access to Discord users the SDK knows about: {@link getCurrentUser} (the authenticated user) and {@link getUser} (a cached user by ID). Both return a plain {@link User} snapshot read from the SDK's `UserHandle` — see {@link ./userHandle.ts}, the template for reading SDK handles into snapshots.
 */
export { getCurrentUser, getUser } from "./users.js";
export type { UserOptions } from "./users.js";
export { readUser } from "./userHandle.js";

export type { User, StatusType, AvatarType } from "./types.js";
