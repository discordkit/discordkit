import { useClient } from "../ambient.js";
import type { DiscordClient } from "../client.js";
import { awaitResult, defineBindings } from "../ffi/bindings.js";
import type { FfiOpaque } from "../ffi/backend.js";
import type { UserId } from "../snowflake.js";
import { readRelationship } from "./relationshipHandle.js";
import type { Relationship } from "./types.js";

/**
 * The relationships domain's client-level operations.
 *
 * - **Reads** are synchronous: `GetRelationships` fills a span out-param (the
 *   first list-returning op — uses the seam's {@link allocSpanOut}/readSpan),
 *   `GetRelationshipHandle` fills a single handle.
 * - **Actions** are async, completing via a result-bearing callback — all the
 *   same `awaitResult` shape, differing only in arg (userId vs username) and
 *   which callback prototype they use (`UpdateRelationship` vs
 *   `SendFriendRequest`; both carry only a result).
 *
 * Per the SDK docs: never take a relationship action without explicit user
 * consent (a button click) — do not auto-send or auto-accept.
 */
const bindings = defineBindings({
  getRelationships: /* C */ `void Discord_Client_GetRelationships(void *self, void *returnValue)`,
  getRelationship: /* C */ `void Discord_Client_GetRelationshipHandle(void *self, uint64_t userId, void *returnValue)`,
  // --- by userId: Discord_Client_UpdateRelationshipCallback(result, userData) ---
  acceptDiscord: /* C */ `void Discord_Client_AcceptDiscordFriendRequest(void *self, uint64_t userId, void *cb, void *cbFree, void *cbUserData)`,
  acceptGame: /* C */ `void Discord_Client_AcceptGameFriendRequest(void *self, uint64_t userId, void *cb, void *cbFree, void *cbUserData)`,
  rejectDiscord: /* C */ `void Discord_Client_RejectDiscordFriendRequest(void *self, uint64_t userId, void *cb, void *cbFree, void *cbUserData)`,
  rejectGame: /* C */ `void Discord_Client_RejectGameFriendRequest(void *self, uint64_t userId, void *cb, void *cbFree, void *cbUserData)`,
  cancelDiscord: /* C */ `void Discord_Client_CancelDiscordFriendRequest(void *self, uint64_t userId, void *cb, void *cbFree, void *cbUserData)`,
  cancelGame: /* C */ `void Discord_Client_CancelGameFriendRequest(void *self, uint64_t userId, void *cb, void *cbFree, void *cbUserData)`,
  removeDiscordAndGame: /* C */ `void Discord_Client_RemoveDiscordAndGameFriend(void *self, uint64_t userId, void *cb, void *cbFree, void *cbUserData)`,
  removeGame: /* C */ `void Discord_Client_RemoveGameFriend(void *self, uint64_t userId, void *cb, void *cbFree, void *cbUserData)`,
  block: /* C */ `void Discord_Client_BlockUser(void *self, uint64_t userId, void *cb, void *cbFree, void *cbUserData)`,
  unblock: /* C */ `void Discord_Client_UnblockUser(void *self, uint64_t userId, void *cb, void *cbFree, void *cbUserData)`,
  sendDiscordById: /* C */ `void Discord_Client_SendDiscordFriendRequestById(void *self, uint64_t userId, void *cb, void *cbFree, void *cbUserData)`,
  sendGameById: /* C */ `void Discord_Client_SendGameFriendRequestById(void *self, uint64_t userId, void *cb, void *cbFree, void *cbUserData)`,
  // --- by username: Discord_Client_SendFriendRequestCallback(result, userData) ---
  sendDiscord: /* C */ `void Discord_Client_SendDiscordFriendRequest(void *self, Discord_String username, void *cb, void *cbFree, void *cbUserData)`,
  sendGame: /* C */ `void Discord_Client_SendGameFriendRequest(void *self, Discord_String username, void *cb, void *cbFree, void *cbUserData)`,
  updateCb: {
    callback: /* C */ `void UpdateRelationshipCallback(void *result, void *userData)`
  },
  sendCb: {
    callback: /* C */ `void SendFriendRequestCallback(void *result, void *userData)`
  }
});

/** Per-call options shared by relationship operations. */
export interface RelationshipOptions {
  /** Target a specific client instead of the ambient singleton. */
  client?: DiscordClient;
  /** Reject if the SDK hasn't acked an action within this many ms. Default 10000. */
  timeoutMs?: number;
}

/**
 * Read every relationship the current user has (friends, blocked, pending) as {@link Relationship} snapshots. Synchronous — reads the SDK's cached list.
 */
export const getRelationships = (
  options: { client?: DiscordClient } = {}
): Relationship[] => {
  const client = options.client ?? useClient();
  const span = client.lib.allocSpanOut();
  bindings(client.lib).getRelationships(client.handle, span);
  return client.lib
    .readSpan(span)
    .map((handle) => readRelationship(client.lib, handle));
};

/**
 * Read the relationship with one user by ID as a {@link Relationship} snapshot. Synchronous; the returned snapshot's types are `none` when there's no relationship.
 */
export const getRelationship = (
  userId: UserId,
  options: { client?: DiscordClient } = {}
): Relationship => {
  const client = options.client ?? useClient();
  const handle = client.lib.allocHandle();
  bindings(client.lib).getRelationship(client.handle, BigInt(userId), handle);
  return readRelationship(client.lib, handle);
};

/** Run one userId-based relationship action via its result callback. */
const action =
  (
    fn: keyof ReturnType<typeof bindings>,
    label: string
  ): ((userId: UserId, options?: RelationshipOptions) => Promise<void>) =>
  async (userId, options = {}) => {
    const client = options.client ?? useClient();
    const b = bindings(client.lib);
    const call = b[fn] as (...args: FfiOpaque[]) => unknown;
    return awaitResult(
      client,
      b.updateCb,
      (ptr) => call(client.handle, BigInt(userId), ptr, null, null),
      () => undefined,
      { timeoutMs: options.timeoutMs, label }
    );
  };

/** Run one username-based friend request via the SendFriendRequest callback. */
const sendByName =
  (
    fn: `sendDiscord` | `sendGame`,
    label: string
  ): ((username: string, options?: RelationshipOptions) => Promise<void>) =>
  async (username, options = {}) => {
    const client = options.client ?? useClient();
    const b = bindings(client.lib);
    return awaitResult(
      client,
      b.sendCb,
      (ptr) =>
        b[fn](
          client.handle,
          client.lib.encodeString(username),
          ptr,
          null,
          null
        ),
      () => undefined,
      { timeoutMs: options.timeoutMs, label }
    );
  };

/** Send a Discord (cross-game) friend request by username. */
export const sendDiscordFriendRequest = sendByName(
  `sendDiscord`,
  `send Discord friend request`
);
/** Send a game (per-game) friend request by username. */
export const sendGameFriendRequest = sendByName(
  `sendGame`,
  `send game friend request`
);
/** Send a Discord friend request to a known user by ID. */
export const sendDiscordFriendRequestById = action(
  `sendDiscordById`,
  `send Discord friend request`
);
/** Send a game friend request to a known user by ID. */
export const sendGameFriendRequestById = action(
  `sendGameById`,
  `send game friend request`
);
/** Accept an incoming Discord friend request from a user. */
export const acceptDiscordFriendRequest = action(
  `acceptDiscord`,
  `accept Discord friend request`
);
/** Accept an incoming game friend request from a user. */
export const acceptGameFriendRequest = action(
  `acceptGame`,
  `accept game friend request`
);
/** Reject an incoming Discord friend request. */
export const rejectDiscordFriendRequest = action(
  `rejectDiscord`,
  `reject Discord friend request`
);
/** Reject an incoming game friend request. */
export const rejectGameFriendRequest = action(
  `rejectGame`,
  `reject game friend request`
);
/** Cancel an outgoing Discord friend request. */
export const cancelDiscordFriendRequest = action(
  `cancelDiscord`,
  `cancel Discord friend request`
);
/** Cancel an outgoing game friend request. */
export const cancelGameFriendRequest = action(
  `cancelGame`,
  `cancel game friend request`
);
/** Remove both the Discord and game friendship with a user. */
export const removeFriend = action(`removeDiscordAndGame`, `remove friend`);
/** Remove only the per-game friendship with a user. */
export const removeGameFriend = action(`removeGame`, `remove game friend`);
/** Block a user (always a Discord-level, cross-game action). */
export const blockUser = action(`block`, `block user`);
/** Unblock a previously-blocked user. */
export const unblockUser = action(`unblock`, `unblock user`);
