/**
 * Lobbies — the public surface of `@discordkit/native/lobbies`.
 *
 * Create/join lobbies and get them back as live {@link Lobby} wrappers
 * ({@link createOrJoinLobby}, {@link getLobby}, {@link getLobbyIds}). A `Lobby`
 * has live getters (`members`, `metadata`, `linkedChannel`), actions
 * (`leave`, `linkChannel`, `unlinkChannel`), and per-lobby event subscriptions
 * (`onMemberAdded`, …). For the channel-linking picker UI, discover the user's
 * servers + channels ({@link getUserGuilds}, {@link getGuildChannels}).
 *
 * Client-wide lobby events ({@link onLobbyCreated}, {@link onLobbyMemberAdded},
 * …) carry ids; re-fetch with {@link getLobby} for the live wrapper.
 */
export {
  createOrJoinLobby,
  getLobby,
  getLobbyIds,
  getUserGuilds,
  getGuildChannels
} from "./lobbies.js";
export type { LobbyOptions } from "./lobbies.js";
export { Lobby } from "./lobbyHandle.js";
export {
  onLobbyCreated,
  onLobbyDeleted,
  onLobbyUpdated,
  onLobbyMemberAdded,
  onLobbyMemberRemoved,
  onLobbyMemberUpdated
} from "./lobbyEvents.js";
export type { LobbyEventOptions } from "./lobbyEvents.js";
export { readLobbyMember } from "./lobbyMember.js";
export { readLinkedChannel } from "./linkedChannel.js";
export { readGuild, readGuildChannel } from "./guildChannel.js";

export type {
  LobbyMember,
  LinkedChannel,
  LobbyMetadata,
  GuildChannel,
  Guild,
  ChannelType,
  ChannelLinkedLobby
} from "./types.js";
