import { LOBBY_CHANNELS, type LobbiesBridge } from "../channels/lobbies.js";
import type { BridgeIo } from "../internal.js";

/** The lobbies client slice — adds the `lobbies` namespace to the bridge. */
export const lobbiesSlice = (io: BridgeIo): { lobbies: LobbiesBridge } => ({
  lobbies: {
    createOrJoin: async (secret, metadata) =>
      io.call(LOBBY_CHANNELS.createOrJoin, secret, metadata),
    get: async (lobbyId) => io.call(LOBBY_CHANNELS.get, lobbyId),
    getIds: async () => io.call(LOBBY_CHANNELS.getIds),
    leave: async (lobbyId) => io.call(LOBBY_CHANNELS.leave, lobbyId),
    linkChannel: async (lobbyId, channelId) =>
      io.call(LOBBY_CHANNELS.linkChannel, lobbyId, channelId),
    unlinkChannel: async (lobbyId) =>
      io.call(LOBBY_CHANNELS.unlinkChannel, lobbyId),
    getUserGuilds: async () => io.call(LOBBY_CHANNELS.getUserGuilds),
    getGuildChannels: async (guildId) =>
      io.call(LOBBY_CHANNELS.getGuildChannels, guildId),
    onCreated: (handler) => io.on(LOBBY_CHANNELS.created, handler),
    onDeleted: (handler) => io.on(LOBBY_CHANNELS.deleted, handler),
    onUpdated: (handler) => io.on(LOBBY_CHANNELS.updated, handler),
    onMemberAdded: (handler) => io.on(LOBBY_CHANNELS.memberAdded, handler),
    onMemberRemoved: (handler) => io.on(LOBBY_CHANNELS.memberRemoved, handler),
    onMemberUpdated: (handler) => io.on(LOBBY_CHANNELS.memberUpdated, handler)
  }
});
