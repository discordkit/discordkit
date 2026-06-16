import {
  MESSAGE_CHANNELS,
  type MessagesBridge
} from "../channels/messaging.js";
import type { BridgeIo } from "../internal.js";

/** The messaging client slice — adds the `messages` namespace. */
export const messagingSlice = (io: BridgeIo): { messages: MessagesBridge } => ({
  messages: {
    sendUser: async (recipientId, content, metadata) =>
      io.call(MESSAGE_CHANNELS.sendUser, recipientId, content, metadata),
    sendLobby: async (lobbyId, content, metadata) =>
      io.call(MESSAGE_CHANNELS.sendLobby, lobbyId, content, metadata),
    editUser: async (recipientId, messageId, content) =>
      io.call(MESSAGE_CHANNELS.editUser, recipientId, messageId, content),
    deleteUser: async (recipientId, messageId) =>
      io.call(MESSAGE_CHANNELS.deleteUser, recipientId, messageId),
    get: async (messageId) => io.call(MESSAGE_CHANNELS.get, messageId),
    getChannel: async (channelId) =>
      io.call(MESSAGE_CHANNELS.getChannel, channelId),
    getUserMessages: async (recipientId, limit) =>
      io.call(MESSAGE_CHANNELS.getUserMessages, recipientId, limit),
    getLobbyMessages: async (lobbyId, limit) =>
      io.call(MESSAGE_CHANNELS.getLobbyMessages, lobbyId, limit),
    getSummaries: async () => io.call(MESSAGE_CHANNELS.getSummaries),
    canOpenInDiscord: async (messageId) =>
      io.call(MESSAGE_CHANNELS.canOpenInDiscord, messageId),
    openInDiscord: async (messageId) =>
      io.call(MESSAGE_CHANNELS.openInDiscord, messageId),
    onCreated: (handler) => io.on(MESSAGE_CHANNELS.created, handler),
    onUpdated: (handler) => io.on(MESSAGE_CHANNELS.updated, handler),
    onDeleted: (handler) => io.on(MESSAGE_CHANNELS.deleted, handler)
  }
});
