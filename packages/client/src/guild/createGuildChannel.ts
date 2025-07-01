import * as v from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { channelSchema, type Channel } from "../channel/types/Channel.js";
import { channelTypeSchema } from "../channel/types/ChannelType.js";
import { overwriteSchema } from "../channel/types/Overwrite.js";
import { videoQualityModeSchema } from "../channel/types/VideoQualityMode.js";
import { autoArchiveDurationSchema } from "../channel/types/AutoArchiveDuration.js";
import { defaultReactionSchema } from "../channel/types/DefaultReaction.js";
import { forumTagSchema } from "../channel/types/ForumTag.js";
import { sortOrderTypeSchema } from "../channel/types/SortOrderType.js";
import { forumLayoutTypeSchema } from "../channel/types/ForumLayoutType.js";

export const createGuildChannelSchema = v.object({
  guild: snowflake,
  body: v.object({
    /** channel name (1-100 characters) */
    name: v.pipe(v.string(), v.nonEmpty()),
    /** the type of channel */
    type: v.nullish(channelTypeSchema),
    /** channel topic (0-1024 characters) */
    topic: v.nullish(v.pipe(v.string(), v.minLength(0), v.maxLength(1024))),
    /** the bitrate (in bits) of the voice or stage channel; min 8000 */
    bitrate: v.nullish(v.pipe(v.number(), v.minValue(8000))),
    /** the user limit of the voice channel */
    userLimit: v.nullish(v.pipe(v.number(), v.integer(), v.minValue(0))),
    /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission manage_messages or manage_channel, are unaffected */
    rateLimitPerYser: v.nullish(
      v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(21600))
    ),
    /** sorting position of the channel */
    position: v.nullish(v.pipe(v.number(), v.integer(), v.minValue(0))),
    /** the channel's permission overwrites */
    permissionOverwrites: v.nullish(v.array(v.partial(overwriteSchema))),
    /** id of the parent category for a channel */
    parentId: v.nullish(snowflake),
    /** whether the channel is nsfw */
    nsfw: v.nullish(v.boolean()),
    /** channel voice region id of the voice or stage channel, automatic when set to null */
    rtcRegion: v.nullish(v.pipe(v.string(), v.nonEmpty())),
    /** the camera video quality mode of the voice channel */
    videoQualityMode: v.nullish(videoQualityModeSchema),
    /** the default duration that the clients use (not the API) for newly created threads in the channel, in minutes, to automatically archive the thread after recent activity */
    defaultAutoArchiveDuration: v.nullish(autoArchiveDurationSchema),
    /** emoji to show in the add reaction button on a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
    defaultReactionEmoji: v.nullish(defaultReactionSchema),
    /** set of tags that can be used in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
    availableTags: v.nullish(v.array(forumTagSchema)),
    /** the default sort order type used to order posts in `GUILD_FORUM` and `GUILD_MEDIA` channels */
    defaultSortOrder: v.nullish(sortOrderTypeSchema),
    /** the default forum layout view used to display posts in `GUILD_FORUM` channels */
    defaultForumLayout: v.nullish(forumLayoutTypeSchema),
    /** the initial `rateLimitPerUser` to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update. */
    defaultThreadRateLimitPerUser: v.nullish(
      v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(21600))
    )
  })
});

/**
 * ### [Create Guild Channel](https://discord.com/developers/docs/resources/guild#create-guild-channel)
 *
 * **POST** `/guilds/:guild/channels`
 *
 * Create a new {@link Channel | channel object} for the guild. Requires the `MANAGE_CHANNELS` permission. If setting permission overwrites, only permissions your bot has in the guild can be allowed/denied. Setting `MANAGE_ROLES` permission in channels is only possible for guild administrators. Returns the new channel object on success. Fires a Channel Create Gateway event.
 *
 * > [!NOTE]
 * >
 * > All parameters to this endpoint are optional and nullable excluding `name`
 *
 * > [!NOTE]
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
