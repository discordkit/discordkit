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

/**
 * Wire the relationships domain's RPC handlers. Imports ONLY
 * `@discordkit/native/relationships`.
 */
export const registerRelationships = ({ handle }: RegisterContext): void => {
  handle(RELATIONSHIP_CHANNELS.list, () => getRelationships());
  handle(RELATIONSHIP_CHANNELS.get, (userId: UserId) =>
    getRelationship(userId)
  );
  handle(RELATIONSHIP_CHANNELS.sendDiscord, async (username: string) =>
    sendDiscordFriendRequest(username)
  );
  handle(RELATIONSHIP_CHANNELS.sendGame, async (username: string) =>
    sendGameFriendRequest(username)
  );
  handle(RELATIONSHIP_CHANNELS.sendDiscordById, async (userId: UserId) =>
    sendDiscordFriendRequestById(userId)
  );
  handle(RELATIONSHIP_CHANNELS.sendGameById, async (userId: UserId) =>
    sendGameFriendRequestById(userId)
  );
  handle(RELATIONSHIP_CHANNELS.acceptDiscord, async (userId: UserId) =>
    acceptDiscordFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.acceptGame, async (userId: UserId) =>
    acceptGameFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.rejectDiscord, async (userId: UserId) =>
    rejectDiscordFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.rejectGame, async (userId: UserId) =>
    rejectGameFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.cancelDiscord, async (userId: UserId) =>
    cancelDiscordFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.cancelGame, async (userId: UserId) =>
    cancelGameFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.remove, async (userId: UserId) =>
    removeFriend(userId)
  );
  handle(RELATIONSHIP_CHANNELS.removeGame, async (userId: UserId) =>
    removeGameFriend(userId)
  );
  handle(RELATIONSHIP_CHANNELS.block, async (userId: UserId) =>
    blockUser(userId)
  );
  handle(RELATIONSHIP_CHANNELS.unblock, async (userId: UserId) =>
    unblockUser(userId)
  );
};
