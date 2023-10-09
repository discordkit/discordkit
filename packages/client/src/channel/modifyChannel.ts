import {
  array,
  boolean,
  integer,
  maxLength,
  maxValue,
  merge,
  minLength,
  minValue,
  nullable,
  nullish,
  number,
  object,
  optional,
  partial,
  string,
  union
} from "valibot";
import type { Fetcher } from "@discordkit/core";
import { toProcedure, patch, toValidated, snowflake } from "@discordkit/core";
import { type Channel, channelSchema } from "./types/Channel.js";
import { autoArchiveDurationSchema } from "./types/AutoArchiveDuration.js";
import { channelTypeSchema } from "./types/ChannelType.js";
import { videoQualityModeSchema } from "./types/VideoQualityMode.js";
import { overwriteSchema } from "./types/Overwrite.js";
import { forumTagSchema } from "./types/ForumTag.js";
import { defaultReactionSchema } from "./types/DefaultReaction.js";
import { sortOrderTypeSchema } from "./types/SortOrderType.js";
import { forumLayoutTypeSchema } from "./types/ForumLayoutType.js";

const sharedChannelOptions = object({
  /** 1-100 character channel name */
  name: string([minLength(1), maxLength(100)])
});

const threadOptions = partial(
  merge([
    sharedChannelOptions,
    object({
      /** whether the thread is archived */
      archived: boolean(),
      /** duration in minutes to automatically archive the thread after recent activity, can be set to: `60`, `1440`, `4320`, `10080` */
      autoArchiveDuration: autoArchiveDurationSchema,
      /** whether the thread is locked; when a thread is locked, only users with `MANAGE_THREADS` can unarchive it */
      locked: boolean(),
      /** whether non-moderators can add other non-moderators to a thread; only available on private threads */
      invitable: boolean(),
      /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages`, `manage_thread`, or `manage_channel`, are unaffected */
      rateLimitPerUser: number([minValue(0), maxValue(21600)]),
      /** channel flags combined as a bitfield; PINNED can only be set for threads in forum channels */
      flags: nullish(number([integer()])),
      /** the IDs of the set of tags that have been applied to a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel; limited to 5 */
      appliedTags: nullish(array(snowflake, [maxLength(5)]))
    })
  ])
);

const groupDMOptions = partial(
  merge([
    sharedChannelOptions,
    object({
      /** base64 encoded icon */
      icon: string([minLength(1)])
    })
  ])
);

const guildChannelOptions = partial(
  merge([
    sharedChannelOptions,
    object({
      /** the type of channel; only conversion between text and news is supported and only in guilds with the "NEWS" feature */
      type: channelTypeSchema,
      /** the position of the channel in the left-hand listing */
      position: optional(number([integer()])),
      /** 0-1024 character channel topic */
      topic: optional(string([minLength(0), maxLength(1024)])),
      /** whether the channel is nsfw */
      nsfw: optional(boolean()),
      /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission manage_messages or manage_channel, are unaffected */
      rateLimitPerUser: optional(number([minValue(0), maxValue(21600)])),
      /** the bitrate (in bits) of the voice or stage channel; min 8000 */
      bitrate: optional(number([minValue(8000)])),
      /** the user limit of the voice or stage channel, max 99 for voice channels and 10,000 for stage channels (0 refers to no limit) */
      userLimit: optional(number([minValue(0), maxValue(10000)])),
      /** channel or category-specific permissions */
      permissionOverwrites: array(partial(overwriteSchema)),
      /** id of the new parent category for a channel */
      parentId: snowflake,
      /** channel voice region id, automatic when set to null */
      rtcRegion: optional(string([minLength(1)])),
      /** the camera video quality mode of the voice channel */
      videoQualityMode: videoQualityModeSchema,
      /** the default duration that the clients use (not the API) for newly created threads in the channel, in minutes, to automatically archive the thread after recent activity */
      defaultAutoArchiveDuration: autoArchiveDurationSchema,
      /** channel flags combined as a bitfield. Currently only `REQUIRE_TAG` (1 << 4) is supported by `GUILD_FORUM` and `GUILD_MEDIA` channels. `HIDE_MEDIA_DOWNLOAD_OPTIONS` (1 << 15) is supported only by `GUILD_MEDIA` channels */
      flags: nullable(number([integer()])),
      /** the set of tags that can be used in a GUILD_FORUM or a GUILD_MEDIA channel; limited to 20 */
      availableTags: nullable(array(forumTagSchema, [maxLength(20)])),
      /** reaction object	the emoji to show in the add reaction button on a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
      defaultReactionEmoji: nullable(defaultReactionSchema),
      /** the initial `rateLimitPerUser` to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update */
      defaultThreadRateLimitPerUser: nullable(
        number([minValue(0), maxValue(21600)])
      ),
      /** the default sort order type used to order posts in `GUILD_FORUM` and GUILD_MED`IA channels */
      defaultSortOrder: nullable(sortOrderTypeSchema),
      /** the default forum layout type used to display posts in `GUILD_FORUM` channels */
      defaultForumLayout: nullable(forumLayoutTypeSchema)
    })
  ])
);

export const modifyChannelSchema = object({
  channel: snowflake,
  body: union([groupDMOptions, guildChannelOptions, threadOptions])
});

/**
 * ### [Modify Channel](https://discord.com/developers/docs/resources/channel#modify-channel)
 *
 * **PATCH** `/channels/:channel`
 *
 * Update a channel's settings. Returns a channel on success, and a `400 BAD REQUEST` on invalid parameters. All JSON parameters are optional.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyChannel: Fetcher<
  typeof modifyChannelSchema,
  Channel
> = async ({ channel, body }) => patch(`/channels/${channel}`, body);

export const modifyChannelSafe = toValidated(
  modifyChannel,
  modifyChannelSchema,
  channelSchema
);

export const modifyChannelProcedure = toProcedure(
  `mutation`,
  modifyChannel,
  modifyChannelSchema,
  channelSchema
);
