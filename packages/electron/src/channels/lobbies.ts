/** The lobbies domain's IPC contract. Mirrors `@discordkit/native/lobbies`. */
import type { UserId, LobbyId, ChannelId, GuildId } from "@discordkit/native";
import type {
  Guild,
  GuildChannel,
  LobbyMetadata,
  LobbySnapshot
} from "@discordkit/native/lobbies";
import type { Unsubscribe } from "../internal.js";

export type { LobbySnapshot };

export const LOBBY_CHANNELS = {
  createOrJoin: `discordkit:lobbies:createOrJoin`,
  get: `discordkit:lobbies:get`,
  getIds: `discordkit:lobbies:getIds`,
  leave: `discordkit:lobbies:leave`,
  linkChannel: `discordkit:lobbies:linkChannel`,
  unlinkChannel: `discordkit:lobbies:unlinkChannel`,
  getUserGuilds: `discordkit:lobbies:getUserGuilds`,
  getGuildChannels: `discordkit:lobbies:getGuildChannels`,
  created: `discordkit:lobbies:created`,
  deleted: `discordkit:lobbies:deleted`,
  updated: `discordkit:lobbies:updated`,
  memberAdded: `discordkit:lobbies:memberAdded`,
  memberRemoved: `discordkit:lobbies:memberRemoved`,
  memberUpdated: `discordkit:lobbies:memberUpdated`
} as const;

/** The `window.discord.lobbies` namespace. */
export interface LobbiesBridge {
  /** Create or join a lobby by secret; resolves with its snapshot. */
  createOrJoin: (
    secret: string,
    metadata?: { lobby?: LobbyMetadata; member?: LobbyMetadata }
  ) => Promise<LobbySnapshot>;
  /** Get a lobby snapshot by id, or `undefined` if not a member. */
  get: (lobbyId: LobbyId) => Promise<LobbySnapshot | undefined>;
  /** The ids of every lobby the current user is in. */
  getIds: () => Promise<LobbyId[]>;
  leave: (lobbyId: LobbyId) => Promise<void>;
  linkChannel: (lobbyId: LobbyId, channelId: ChannelId) => Promise<void>;
  unlinkChannel: (lobbyId: LobbyId) => Promise<void>;
  /** Servers with channels linkable to a lobby (for a picker UI). */
  getUserGuilds: () => Promise<Guild[]>;
  /** Linkable channels in a guild (for a picker UI). */
  getGuildChannels: (guildId: GuildId) => Promise<GuildChannel[]>;
  onCreated: (handler: (lobbyId: LobbyId) => void) => Unsubscribe;
  onDeleted: (handler: (lobbyId: LobbyId) => void) => Unsubscribe;
  onUpdated: (handler: (lobbyId: LobbyId) => void) => Unsubscribe;
  onMemberAdded: (
    handler: (lobbyId: LobbyId, memberId: UserId) => void
  ) => Unsubscribe;
  onMemberRemoved: (
    handler: (lobbyId: LobbyId, memberId: UserId) => void
  ) => Unsubscribe;
  onMemberUpdated: (
    handler: (lobbyId: LobbyId, memberId: UserId) => void
  ) => Unsubscribe;
}
