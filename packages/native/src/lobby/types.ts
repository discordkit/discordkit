import type {
  ApplicationId,
  ChannelId,
  GuildId,
  LobbyId,
  UserId
} from "../snowflake.js";
import type { User } from "../users/types.js";

/**
 * Public types for the lobbies domain.
 *
 * The `LobbyHandle` itself is surfaced as a LIVE wrapper class ({@link ../lobby/lobbyHandle.js | Lobby}), not a snapshot — the SDK docs are explicit that lobby handles hold a live reference whose data updates in place, and lobbies are long-lived + interactive + event-driven (the §1.4 case for a class). But the lobby's *sub-objects* (members, the linked channel, guild/channel discovery results) are read-only values, so those follow the read-handle→snapshot convention like users/relationships.
 *
 * Metadata is a plain `Record<string, string>` (the SDK's `Discord_Properties` map) — an internal game-controlled shape with no validation/fixture need, so no schema (§1.5).
 */

/** Developer-supplied string→string metadata on a lobby or lobby member. */
export type LobbyMetadata = Record<string, string>;

/** A snapshot of one member of a lobby, read from a `LobbyMemberHandle`. */
export interface LobbyMember {
  /** The member's user id. */
  id: UserId;
  /** Whether the user is actively connected to the lobby right now (vs. merely
   * added to it while offline). */
  connected: boolean;
  /** Whether this member may link a Discord channel to the lobby (server-set flag). */
  canLinkLobby: boolean;
  /** Per-member developer metadata (e.g. the game's internal user id mapping). */
  metadata: LobbyMetadata;
  /** The member's user, if the SDK has their handle available. */
  user?: User;
}

/** A snapshot of the Discord channel a lobby is linked to, if any. */
export interface LinkedChannel {
  /** The linked channel's id. */
  id: ChannelId;
  /** The channel's name. */
  name: string;
  /** The id of the guild (server) that owns the channel. */
  guildId: GuildId;
}

/** The kind of a Discord channel, the public string form of `Discord_ChannelType`. */
export type ChannelType =
  | `guildText`
  | `dm`
  | `guildVoice`
  | `groupDm`
  | `guildCategory`
  | `guildNews`
  | `guildStore`
  | `guildNewsThread`
  | `guildPublicThread`
  | `guildPrivateThread`
  | `unknown`;

/** Maps the ABI's numeric `Discord_ChannelType` to the public string form. */
export const CHANNEL_TYPE_BY_CODE: Record<number, ChannelType> = {
  0: `guildText`,
  1: `dm`,
  2: `guildVoice`,
  3: `groupDm`,
  4: `guildCategory`,
  5: `guildNews`,
  6: `guildStore`,
  10: `guildNewsThread`,
  11: `guildPublicThread`,
  12: `guildPrivateThread`
};

/** A snapshot of a lobby currently linked to a channel (from the channel's side). */
export interface ChannelLinkedLobby {
  /** The linked lobby's id. */
  lobbyId: LobbyId;
  /** The id of the application that owns the lobby. */
  applicationId: ApplicationId;
}

/**
 * A snapshot of a guild channel the current user can see — the candidates for linking a lobby to a Discord channel (`getGuildChannels`).
 */
export interface GuildChannel {
  /** The channel's id. */
  id: ChannelId;
  /** The channel's name. */
  name: string;
  /** The channel's type. */
  type: ChannelType;
  /** The channel's position in the guild's channel list. */
  position: number;
  /** The parent category channel's id, if any. */
  parentId?: ChannelId;
  /** Whether the current user can link this channel to a lobby (see the SDK's
   * linkability rules: text channel, not NSFW, not already linked, has perms). */
  linkable: boolean;
  /** Whether every guild member can view + write the channel (vs. a private
   * channel whose contents would still be exposed to all lobby members). */
  viewableByAll: boolean;
  /** The lobby this channel is already linked to, if any. */
  linkedLobby?: ChannelLinkedLobby;
}

/** A snapshot of a guild (server) the current user belongs to (`getUserGuilds`). */
export interface Guild {
  /** The guild's id. */
  id: GuildId;
  /** The guild's name. */
  name: string;
}
