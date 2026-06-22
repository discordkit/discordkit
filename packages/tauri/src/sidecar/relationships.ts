import {
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
} from "@discordkit/native/relationships";
import type { UserId } from "@discordkit/native";
import { RELATIONSHIP_CHANNELS } from "../channels/relationships.js";
import type { RegisterContext } from "../internal.js";

/** Brand a kkrpc-boundary `unknown` arg as a `UserId` (already a string). */
const uid = (value: unknown): UserId => value as UserId;

/**
 * Wire the relationships domain's RPC handlers. Imports ONLY
 * `@discordkit/native/relationships`. Snowflake ids are strings end-to-end
 * (webview ↔ native), so `uid()` is just the boundary brand-cast — no coercion.
 */
export const registerRelationships = ({ handle }: RegisterContext): void => {
  handle(RELATIONSHIP_CHANNELS.list, () => getRelationships());
  handle(RELATIONSHIP_CHANNELS.get, (userId: unknown) =>
    getRelationship(uid(userId))
  );
  handle(RELATIONSHIP_CHANNELS.sendDiscord, async (username: string) =>
    sendDiscordFriendRequest(username)
  );
  handle(RELATIONSHIP_CHANNELS.sendGame, async (username: string) =>
    sendGameFriendRequest(username)
  );
  handle(RELATIONSHIP_CHANNELS.sendDiscordById, async (userId: unknown) =>
    sendDiscordFriendRequestById(uid(userId))
  );
  handle(RELATIONSHIP_CHANNELS.sendGameById, async (userId: unknown) =>
    sendGameFriendRequestById(uid(userId))
  );
  handle(RELATIONSHIP_CHANNELS.acceptDiscord, async (userId: unknown) =>
    acceptDiscordFriendRequest(uid(userId))
  );
  handle(RELATIONSHIP_CHANNELS.acceptGame, async (userId: unknown) =>
    acceptGameFriendRequest(uid(userId))
  );
  handle(RELATIONSHIP_CHANNELS.rejectDiscord, async (userId: unknown) =>
    rejectDiscordFriendRequest(uid(userId))
  );
  handle(RELATIONSHIP_CHANNELS.rejectGame, async (userId: unknown) =>
    rejectGameFriendRequest(uid(userId))
  );
  handle(RELATIONSHIP_CHANNELS.cancelDiscord, async (userId: unknown) =>
    cancelDiscordFriendRequest(uid(userId))
  );
  handle(RELATIONSHIP_CHANNELS.cancelGame, async (userId: unknown) =>
    cancelGameFriendRequest(uid(userId))
  );
  handle(RELATIONSHIP_CHANNELS.remove, async (userId: unknown) =>
    removeFriend(uid(userId))
  );
  handle(RELATIONSHIP_CHANNELS.removeGame, async (userId: unknown) =>
    removeGameFriend(uid(userId))
  );
  handle(RELATIONSHIP_CHANNELS.block, async (userId: unknown) =>
    blockUser(uid(userId))
  );
  handle(RELATIONSHIP_CHANNELS.unblock, async (userId: unknown) =>
    unblockUser(uid(userId))
  );
};
