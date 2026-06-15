/** The messaging domain's IPC contract. Mirrors `@discordkit/native/messaging`. */
import type {
  Channel,
  Message,
  UserMessageSummary
} from "@discordkit/native/messaging";

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

/** The `window.discord.messages` namespace. */
export interface MessagesBridge {
  /** Send a DM; resolves with the new message id. */
  sendUser: (
    recipientId: bigint,
    content: string,
    metadata?: Record<string, string>
  ) => Promise<bigint>;
  /** Send a lobby message; resolves with the new message id. */
  sendLobby: (
    lobbyId: bigint,
    content: string,
    metadata?: Record<string, string>
  ) => Promise<bigint>;
  editUser: (
    recipientId: bigint,
    messageId: bigint,
    content: string
  ) => Promise<void>;
  deleteUser: (recipientId: bigint, messageId: bigint) => Promise<void>;
  get: (messageId: bigint) => Promise<Message | undefined>;
  getChannel: (channelId: bigint) => Promise<Channel | undefined>;
  getUserMessages: (recipientId: bigint, limit: number) => Promise<Message[]>;
  getLobbyMessages: (lobbyId: bigint, limit: number) => Promise<Message[]>;
  getSummaries: () => Promise<UserMessageSummary[]>;
  canOpenInDiscord: (messageId: bigint) => Promise<boolean>;
  openInDiscord: (messageId: bigint) => Promise<void>;
  onCreated: (handler: (messageId: bigint) => void) => () => void;
  onUpdated: (handler: (messageId: bigint) => void) => () => void;
  onDeleted: (
    handler: (messageId: bigint, channelId: bigint) => void
  ) => () => void;
}
