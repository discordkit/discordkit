import { useClient } from "../ambient.js";
import type { DiscordClient } from "../client.js";
import { defineBindings } from "../ffi/bindings.js";
import { readUser } from "./userHandle.js";
import type { User } from "./types.js";

/**
 * The users domain's client-level operations. `GetCurrentUserV2` and `GetUser` are SYNCHRONOUS — they fill a `UserHandle` out-param and return a `bool` for validity (no callback/promise). We read the handle into a {@link User} snapshot and return `undefined` when the SDK reports the handle invalid (e.g. the user isn't in the SDK's cache yet).
 */
const bindings = defineBindings({
  getCurrentUser: /* C */ `bool Discord_Client_GetCurrentUserV2(void *self, void *returnValue)`,
  getUser: /* C */ `bool Discord_Client_GetUser(void *self, uint64_t userId, void *returnValue)`
});

/** Per-call options shared by user operations. */
export interface UserOptions {
  /** Target a specific client instead of the ambient singleton. */
  client?: DiscordClient;
}

/**
 * Read the currently-authenticated user as a {@link User} snapshot, or `undefined` if there's no current user yet (e.g. before auth/connect). Synchronous — reads the SDK's cached handle; no network round-trip.
 */
export const getCurrentUser = (options: UserOptions = {}): User | undefined => {
  const client = options.client ?? useClient();
  const handle = client.lib.allocHandle();
  const valid = bindings(client.lib).getCurrentUser(client.handle, handle);
  return valid ? readUser(client.lib, handle) : undefined;
};

/**
 * Read a known user by ID as a {@link User} snapshot, or `undefined` if the SDK doesn't have that user cached. Synchronous — this reads the SDK's local cache (populated via relationships, lobby membership, messages, …); it is NOT a REST fetch of an arbitrary user.
 */
export const getUser = (
  userId: bigint,
  options: UserOptions = {}
): User | undefined => {
  const client = options.client ?? useClient();
  const handle = client.lib.allocHandle();
  const valid = bindings(client.lib).getUser(client.handle, userId, handle);
  return valid ? readUser(client.lib, handle) : undefined;
};
