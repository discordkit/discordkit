import { z } from "zod";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { channelSchema, type Channel } from "../channel/types/Channel.ts";
import { channelTypeSchema } from "../channel/types/ChannelType.ts";
import { overwriteSchema } from "../channel/types/Overwrite.ts";
import { videoQualityModeSchema } from "../channel/types/VideoQualityMode.ts";
import { autoArchiveDurationSchema } from "../channel/types/AutoArchiveDuration.ts";
import { defaultReactionSchema } from "../channel/types/DefaultReaction.ts";
import { forumTagSchema } from "../channel/types/ForumTag.ts";
import { sortOrderTypeSchema } from "../channel/types/SortOrderType.ts";
import { forumLayoutTypeSchema } from "../channel/types/ForumLayoutType.ts";

export const createGuildChannelSchema = z.object({
  guild: snowflake,
  body: z.object({
    /** channel name (1-100 characters) */
    name: z.string().min(1),
    /** the type of channel */
    type: channelTypeSchema.nullable().optional(),
    /** channel topic (0-1024 characters) */
    topic: z.string().min(0).max(1024).nullable().optional(),
    /** the bitrate (in bits) of the voice or stage channel; min 8000 */
    bitrate: z.number().min(8000).nullable().optional(),
    /** the user limit of the voice channel */
    userLimit: z.number().int().positive().nullable().optional(),
    /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission manage_messages or manage_channel, are unaffected */
    rateLimitPerYser: z.number().int().min(0).max(21600).nullable().optional(),
    /** sorting position of the channel */
    position: z.number().int().positive().nullable().optional(),
    /** the channel's permission overwrites */
    permissionOverwrites: overwriteSchema
      .partial()
      .array()
      .nullable()
      .optional(),
    /** id of the parent category for a channel */
    parentId: snowflake.nullable().optional(),
    /** whether the channel is nsfw */
    nsfw: z.boolean().nullable().optional(),
    /** channel voice region id of the voice or stage channel, automatic when set to null */
    rtcRegion: z.string().min(1).nullable().optional(),
    /** the camera video quality mode of the voice channel */
    videoQualityMode: videoQualityModeSchema.nullable().optional(),
    /** the default duration that the clients use (not the API) for newly created threads in the channel, in minutes, to automatically archive the thread after recent activity */
    defaultAutoArchiveDuration: autoArchiveDurationSchema.nullable().optional(),
    /** emoji to show in the add reaction button on a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
    defaultReactionEmoji: defaultReactionSchema.nullable().optional(),
    /** set of tags that can be used in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
    availableTags: forumTagSchema.array().nullable().optional(),
    /** the default sort order type used to order posts in `GUILD_FORUM` and `GUILD_MEDIA` channels */
    defaultSortOrder: sortOrderTypeSchema.nullable().optional(),
    /** the default forum layout view used to display posts in `GUILD_FORUM` channels */
    defaultForumLayout: forumLayoutTypeSchema.nullable().optional(),
    /** the initial `rateLimitPerUser` to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update. */
    defaultThreadRateLimitPerUser: z
      .number()
      .int()
      .min(0)
      .max(21600)
      .nullable()
      .optional()
  })
});

/**
 * ### [Create Guild Channel](https://discord.com/developers/docs/resources/guild#create-guild-channel)
 *
 * **POST** `/guilds/:guild/channels`
 *
 * Create a new {@link Channel | channel object} for the guild. Requires the `MANAGE_CHANNELS` permission. If setting permission overwrites, only permissions your bot has in the guild can be allowed/denied. Setting `MANAGE_ROLES` permission in channels is only possible for guild administrators. Returns the new channel object on success. Fires a Channel Create Gateway event.
 *
 * > **NOTE**
 * >
 * > All parameters to this endpoint are optional and nullable excluding `name`
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const createGuildChannel: Fetcher<
  typeof createGuildChannelSchema,
  Channel
> = async ({ guild, body }) => post(`/guilds/${guild}/channels`, body);

export const createGuildChannelSafe = toValidated(
  createGuildChannel,
  createGuildChannelSchema,
  channelSchema
);

export const createGuildChannelProcedure = toProcedure(
  `mutation`,
  createGuildChannel,
  createGuildChannelSchema,
  channelSchema
);
