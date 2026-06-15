import {
  RELATIONSHIP_CHANNELS,
  type RelationshipsBridge
} from "../channels/relationships.js";
import type { BridgeIo } from "../internal.js";

/** The relationships preload slice — adds `window.discord.relationships`. */
export const relationshipsSlice = (
  io: BridgeIo
): { relationships: RelationshipsBridge } => ({
  relationships: {
    list: async () => io.call(RELATIONSHIP_CHANNELS.list),
    get: async (userId) => io.call(RELATIONSHIP_CHANNELS.get, userId),
    sendDiscordRequest: async (username) =>
      io.call(RELATIONSHIP_CHANNELS.sendDiscord, username),
    sendGameRequest: async (username) =>
      io.call(RELATIONSHIP_CHANNELS.sendGame, username),
    sendDiscordRequestById: async (userId) =>
      io.call(RELATIONSHIP_CHANNELS.sendDiscordById, userId),
    sendGameRequestById: async (userId) =>
      io.call(RELATIONSHIP_CHANNELS.sendGameById, userId),
    acceptDiscordRequest: async (userId) =>
      io.call(RELATIONSHIP_CHANNELS.acceptDiscord, userId),
    acceptGameRequest: async (userId) =>
      io.call(RELATIONSHIP_CHANNELS.acceptGame, userId),
    rejectDiscordRequest: async (userId) =>
      io.call(RELATIONSHIP_CHANNELS.rejectDiscord, userId),
    rejectGameRequest: async (userId) =>
      io.call(RELATIONSHIP_CHANNELS.rejectGame, userId),
    cancelDiscordRequest: async (userId) =>
      io.call(RELATIONSHIP_CHANNELS.cancelDiscord, userId),
    cancelGameRequest: async (userId) =>
      io.call(RELATIONSHIP_CHANNELS.cancelGame, userId),
    remove: async (userId) => io.call(RELATIONSHIP_CHANNELS.remove, userId),
    removeGame: async (userId) =>
      io.call(RELATIONSHIP_CHANNELS.removeGame, userId),
    block: async (userId) => io.call(RELATIONSHIP_CHANNELS.block, userId),
    unblock: async (userId) => io.call(RELATIONSHIP_CHANNELS.unblock, userId)
  }
});
