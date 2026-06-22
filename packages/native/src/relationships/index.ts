/**
 * Relationships — the public surface of `@discordkit/native/relationships`.
 *
 * Read the current user's friends/blocked/pending list ({@link getRelationships}, {@link getRelationship}) as plain {@link Relationship} snapshots, and manage relationships (send/accept/reject/cancel friend requests, remove friends, block/unblock).
 *
 * Per the SDK: only invoke the action APIs in response to an explicit user action (a button click) — never auto-send or auto-accept.
 */
export {
  getRelationships,
  getRelationship,
  sendDiscordFriendRequest,
  sendGameFriendRequest,
  sendDiscordFriendRequestById,
  sendGameFriendRequestById,
  acceptDiscordFriendRequest,
  acceptGameFriendRequest,
  rejectDiscordFriendRequest,
  rejectGameFriendRequest,
  cancelDiscordFriendRequest,
  cancelGameFriendRequest,
  removeFriend,
  removeGameFriend,
  blockUser,
  unblockUser
} from "./relationships.js";
export type { RelationshipOptions } from "./relationships.js";
export { readRelationship } from "./relationshipHandle.js";

export type { Relationship, RelationshipType } from "./types.js";
