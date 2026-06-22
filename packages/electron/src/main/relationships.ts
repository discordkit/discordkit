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
 * Wire the relationships domain's IPC handlers. Imports ONLY
 * `@discordkit/native/relationships`.
 */
export const registerRelationships = ({ handle }: RegisterContext): void => {
  handle(RELATIONSHIP_CHANNELS.list, () => getRelationships());
  handle(RELATIONSHIP_CHANNELS.get, (_e, userId: UserId) =>
    getRelationship(userId)
  );
  handle(RELATIONSHIP_CHANNELS.sendDiscord, async (_e, username: string) =>
    sendDiscordFriendRequest(username)
  );
  handle(RELATIONSHIP_CHANNELS.sendGame, async (_e, username: string) =>
    sendGameFriendRequest(username)
  );
  handle(RELATIONSHIP_CHANNELS.sendDiscordById, async (_e, userId: UserId) =>
    sendDiscordFriendRequestById(userId)
  );
  handle(RELATIONSHIP_CHANNELS.sendGameById, async (_e, userId: UserId) =>
    sendGameFriendRequestById(userId)
  );
  handle(RELATIONSHIP_CHANNELS.acceptDiscord, async (_e, userId: UserId) =>
    acceptDiscordFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.acceptGame, async (_e, userId: UserId) =>
    acceptGameFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.rejectDiscord, async (_e, userId: UserId) =>
    rejectDiscordFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.rejectGame, async (_e, userId: UserId) =>
    rejectGameFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.cancelDiscord, async (_e, userId: UserId) =>
    cancelDiscordFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.cancelGame, async (_e, userId: UserId) =>
    cancelGameFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.remove, async (_e, userId: UserId) =>
    removeFriend(userId)
  );
  handle(RELATIONSHIP_CHANNELS.removeGame, async (_e, userId: UserId) =>
    removeGameFriend(userId)
  );
  handle(RELATIONSHIP_CHANNELS.block, async (_e, userId: UserId) =>
    blockUser(userId)
  );
  handle(RELATIONSHIP_CHANNELS.unblock, async (_e, userId: UserId) =>
    unblockUser(userId)
  );
};
