// https://discord.com/developers/docs/events/gateway-events#guild-member-add

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { timestamp } from "@discordkit/core/validations/timestamp";
import { memberSchema } from "@discordkit/client/guild/types/Member";
import { userSchema } from "@discordkit/client/user/types/User";
import type { Member } from "@discordkit/client/guild/types/Member";
import type { User } from "@discordkit/client/user/types/User";

/**
 * `GUILD_MEMBER_ADD` — a guild member plus the guild it joined.
 *
 * The docs' field table for this event lists **only** `guild_id`, because the
 * prose above it says the payload is "a guild member object with an extra
 * `guild_id` key". Reading the table alone would drop every member field.
 */
export interface GuildMemberAdd extends Member {
  /** ID of the guild */
  guildId: string;
}

export const guildMemberAddSchema = schema<GuildMemberAdd>(
  v.intersect([memberSchema, v.object({ guildId: snowflake })])
);

const _guildMemberRemoveSchema = v.object({
  /** ID of the guild */
  guildId: snowflake,
  /** User who was removed */
  user: userSchema
});

export interface GuildMemberRemove extends v.InferOutput<
  typeof _guildMemberRemoveSchema
> {}

/**
 * ### [Guild Member Remove](https://discord.com/developers/docs/events/gateway-events#guild-member-remove)
 *
 * Only the user and guild — the member object is gone with the membership, so
 * roles and nickname are unavailable unless you cached them.
 */
export const guildMemberRemoveSchema = schema<GuildMemberRemove>(
  _guildMemberRemoveSchema
);

/**
 * `GUILD_MEMBER_UPDATE` is **not** a member object plus extras — Discord
 * documents its own flattened field list, so it's defined here rather than
 * composed from `memberSchema`. Notably `joinedAt` is nullable here (it isn't
 * on the base member) and `roles`/`user` are always present.
 */
const _guildMemberUpdateSchema = v.object({
  /** ID of the guild */
  guildId: snowflake,
  /** User role ids */
  roles: v.array(snowflake),
  /** The user */
  user: userSchema,
  /** Nickname of the user in the guild */
  nick: v.optional(v.nullable(v.string())),
  /** The member's guild avatar hash */
  avatar: v.nullable(v.string()),
  /** The member's guild banner hash */
  banner: v.nullable(v.string()),
  /** When the user joined the guild */
  joinedAt: v.nullable(timestamp),
  /** When the user starting boosting the guild */
  premiumSince: v.optional(v.nullable(timestamp)),
  /** Whether the user is deafened in voice channels */
  deaf: v.optional(v.boolean()),
  /** Whether the user is muted in voice channels */
  mute: v.optional(v.boolean()),
  /** Whether the user has not yet passed the guild's Membership Screening requirements */
  pending: v.optional(v.boolean()),
  /** When the user's timeout will expire and they will be able to communicate again */
  communicationDisabledUntil: v.optional(v.nullable(timestamp)),
  /** Data for the member's guild avatar decoration */
  avatarDecorationData: v.optional(v.nullable(v.unknown())),
  /** Data for the member's collectibles */
  collectibles: v.optional(v.nullable(v.unknown()))
});

export interface GuildMemberUpdate extends v.InferOutput<
  typeof _guildMemberUpdateSchema
> {}

/**
 * ### [Guild Member Update](https://discord.com/developers/docs/events/gateway-events#guild-member-update)
 */
export const guildMemberUpdateSchema = schema<GuildMemberUpdate>(
  _guildMemberUpdateSchema
);

const _guildMembersChunkSchema = v.object({
  /** ID of the guild */
  guildId: snowflake,
  /** Set of guild members */
  members: v.array(memberSchema),
  /** Chunk index in the expected chunks for this response */
  chunkIndex: v.number(),
  /** Total number of expected chunks for this response */
  chunkCount: v.number(),
  /** Ids that could not be found */
  notFound: v.optional(v.array(snowflake)),
  /** Presences of the returned members */
  presences: v.optional(v.array(v.unknown())),
  /** Nonce used in the Guild Request Members request */
  nonce: v.optional(v.string())
});

export interface GuildMembersChunk extends v.InferOutput<
  typeof _guildMembersChunkSchema
> {}

/**
 * ### [Guild Members Chunk](https://discord.com/developers/docs/events/gateway-events#guild-members-chunk)
 *
 * Sent in response to a Request Guild Members send-event. Use `chunkIndex` and
 * `chunkCount` to tell how many chunks are still coming — a large guild arrives
 * across many events, not one.
 */
export const guildMembersChunkSchema = schema<GuildMembersChunk>(
  _guildMembersChunkSchema
);

const _guildBanSchema = v.object({
  /** ID of the guild */
  guildId: snowflake,
  /** User who was banned */
  user: userSchema
});

export interface GuildBan extends v.InferOutput<typeof _guildBanSchema> {}

/**
 * ### [Guild Ban Add](https://discord.com/developers/docs/events/gateway-events#guild-ban-add)
 *
 * Shared by the add and remove events, which carry identical fields.
 */
export const guildBanSchema = schema<GuildBan>(_guildBanSchema);
