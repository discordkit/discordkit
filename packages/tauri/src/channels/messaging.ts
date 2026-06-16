/** The messaging domain's bridge contract. Mirrors `@discordkit/native/messaging`. */
import type { UserId, LobbyId, ChannelId, MessageId } from "@discordkit/native";
import type {
  Channel,
  Message,
  UserMessageSummary
} from "@discordkit/native/messaging";
import type { Unsubscribe } from "../internal.js";

export const MESSAGE_CHANNELS = {
  sendUser: `discordkit:messages:sendUser`,
  sendLobby: `discordkit:messages:sendLobby`,
  editUser: `discordkit:messages:editUser`,
  deleteUser: `discordkit:messages:deleteUser`,
  get: `discordkit:messages:get`,
  getChannel: `discordkit:messages:getChannel`,
  getUserMessages: `discordkit:messages:getUserMessages`,
  getLobbyMessages: `discordkit:messages:getLobbyMessages`,
  getSummaries: `discordkit:messages:getSummaries`,
  canOpenInDiscord: `discordkit:messages:canOpenInDiscord`,
  openInDiscord: `discordkit:messages:openInDiscord`,
  created: `discordkit:messages:created`,
  updated: `discordkit:messages:updated`,
  deleted: `discordkit:messages:deleted`
} as const;

/** The `messages` namespace on the webview bridge. */
export interface MessagesBridge {
  /** Send a DM; resolves with the new message id. */
  sendUser: (
    recipientId: UserId,
    content: string,
    metadata?: Record<string, string>
  ) => Promise<MessageId>;
  /** Send a lobby message; resolves with the new message id. */
  sendLobby: (
    lobbyId: LobbyId,
    content: string,
    metadata?: Record<string, string>
  ) => Promise<MessageId>;
  editUser: (
    recipientId: UserId,
    messageId: MessageId,
    content: string
  ) => Promise<void>;
  deleteUser: (recipientId: UserId, messageId: MessageId) => Promise<void>;
  get: (messageId: MessageId) => Promise<Message | undefined>;
  getChannel: (channelId: ChannelId) => Promise<Channel | undefined>;
  getUserMessages: (recipientId: UserId, limit: number) => Promise<Message[]>;
  getLobbyMessages: (lobbyId: LobbyId, limit: number) => Promise<Message[]>;
  getSummaries: () => Promise<UserMessageSummary[]>;
  canOpenInDiscord: (messageId: MessageId) => Promise<boolean>;
  openInDiscord: (messageId: MessageId) => Promise<void>;
  onCreated: (handler: (messageId: MessageId) => void) => Unsubscribe;
  onUpdated: (handler: (messageId: MessageId) => void) => Unsubscribe;
  onDeleted: (
    handler: (messageId: MessageId, channelId: ChannelId) => void
  ) => Unsubscribe;
}
