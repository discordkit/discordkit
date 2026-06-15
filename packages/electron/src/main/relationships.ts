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
import { RELATIONSHIP_CHANNELS } from "../channels/relationships.js";
import type { RegisterContext } from "../internal.js";

/**
 * Wire the relationships domain's IPC handlers. Imports ONLY
 * `@discordkit/native/relationships`.
 */
export const registerRelationships = ({ handle }: RegisterContext): void => {
  handle(RELATIONSHIP_CHANNELS.list, () => getRelationships());
  handle(RELATIONSHIP_CHANNELS.get, (_e, userId: bigint) =>
    getRelationship(userId)
  );
  handle(RELATIONSHIP_CHANNELS.sendDiscord, async (_e, username: string) =>
    sendDiscordFriendRequest(username)
  );
  handle(RELATIONSHIP_CHANNELS.sendGame, async (_e, username: string) =>
    sendGameFriendRequest(username)
  );
  handle(RELATIONSHIP_CHANNELS.sendDiscordById, async (_e, userId: bigint) =>
    sendDiscordFriendRequestById(userId)
  );
  handle(RELATIONSHIP_CHANNELS.sendGameById, async (_e, userId: bigint) =>
    sendGameFriendRequestById(userId)
  );
  handle(RELATIONSHIP_CHANNELS.acceptDiscord, async (_e, userId: bigint) =>
    acceptDiscordFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.acceptGame, async (_e, userId: bigint) =>
    acceptGameFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.rejectDiscord, async (_e, userId: bigint) =>
    rejectDiscordFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.rejectGame, async (_e, userId: bigint) =>
    rejectGameFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.cancelDiscord, async (_e, userId: bigint) =>
    cancelDiscordFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.cancelGame, async (_e, userId: bigint) =>
    cancelGameFriendRequest(userId)
  );
  handle(RELATIONSHIP_CHANNELS.remove, async (_e, userId: bigint) =>
    removeFriend(userId)
  );
  handle(RELATIONSHIP_CHANNELS.removeGame, async (_e, userId: bigint) =>
    removeGameFriend(userId)
  );
  handle(RELATIONSHIP_CHANNELS.block, async (_e, userId: bigint) =>
    blockUser(userId)
  );
  handle(RELATIONSHIP_CHANNELS.unblock, async (_e, userId: bigint) =>
    unblockUser(userId)
  );
};
