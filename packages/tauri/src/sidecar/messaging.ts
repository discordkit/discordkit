import {
  sendUserMessage,
  sendLobbyMessage,
  editUserMessage,
  deleteUserMessage,
  getMessage,
  getChannel,
  getUserMessages,
  getLobbyMessages,
  getUserMessageSummaries,
  canOpenMessageInDiscord,
  openMessageInDiscord,
  onMessageCreated,
  onMessageUpdated,
  onMessageDeleted
} from "@discordkit/native/messaging";
import type { UserId, LobbyId, ChannelId, MessageId } from "@discordkit/native";
import { MESSAGE_CHANNELS } from "../channels/messaging.js";
import type { RegisterContext } from "../internal.js";

/**
 * Wire the messaging domain: its RPC handlers + message event broadcasts.
 * Imports ONLY `@discordkit/native/messaging`.
 */
export const registerMessaging = ({
  handle,
  broadcast,
  track
}: RegisterContext): void => {
  handle(
    MESSAGE_CHANNELS.sendUser,
    async (
      recipientId: UserId,
      content: string,
      metadata?: Record<string, string>
    ) => sendUserMessage(recipientId, content, { metadata })
  );
  handle(
    MESSAGE_CHANNELS.sendLobby,
    async (
      lobbyId: LobbyId,
      content: string,
      metadata?: Record<string, string>
    ) => sendLobbyMessage(lobbyId, content, { metadata })
  );
  handle(
    MESSAGE_CHANNELS.editUser,
    async (recipientId: UserId, messageId: MessageId, content: string) =>
      editUserMessage(recipientId, messageId, content)
  );
  handle(
    MESSAGE_CHANNELS.deleteUser,
    async (recipientId: UserId, messageId: MessageId) =>
      deleteUserMessage(recipientId, messageId)
  );
  handle(MESSAGE_CHANNELS.get, (messageId: MessageId) => getMessage(messageId));
  handle(MESSAGE_CHANNELS.getChannel, (channelId: ChannelId) =>
    getChannel(channelId)
  );
  handle(
    MESSAGE_CHANNELS.getUserMessages,
    async (recipientId: UserId, limit: number) =>
      getUserMessages(recipientId, limit)
  );
  handle(
    MESSAGE_CHANNELS.getLobbyMessages,
    async (lobbyId: LobbyId, limit: number) => getLobbyMessages(lobbyId, limit)
  );
  handle(MESSAGE_CHANNELS.getSummaries, async () => getUserMessageSummaries());
  handle(MESSAGE_CHANNELS.canOpenInDiscord, (messageId: MessageId) =>
    canOpenMessageInDiscord(messageId)
  );
  handle(MESSAGE_CHANNELS.openInDiscord, async (messageId: MessageId) =>
    openMessageInDiscord(messageId)
  );

  track(onMessageCreated((id) => broadcast(MESSAGE_CHANNELS.created, id)));
  track(onMessageUpdated((id) => broadcast(MESSAGE_CHANNELS.updated, id)));
  track(
    onMessageDeleted((id, channelId) =>
      broadcast(MESSAGE_CHANNELS.deleted, id, channelId)
    )
  );
};
