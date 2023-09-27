import { z } from "zod";
import type { Fetcher } from "../utils";
import { toProcedure, patch } from "../utils";
import { type Channel, channelSchema } from "./types/Channel";
import { autoArchiveDurationSchema } from "./types/AutoArchiveDuration";
import { channelTypeSchema } from "./types/ChannelType";
import { videoQualityModeSchema } from "./types/VideoQualityMode";
import {
  defaultReactionSchema,
  forumLayoutTypeSchema,
  forumTagSchema,
  overwriteSchema,
  sortOrderTypeSchema
} from "./types";

const sharedChannelOptions = z.object({
  /** 1-100 character channel name */
  name: z.string().min(1).max(100)
});

const threadOptions = sharedChannelOptions
  .extend({
    /** whether the thread is archived */
    archived: z.boolean(),
    /** duration in minutes to automatically archive the thread after recent activity, can be set to: `60`, `1440`, `4320`, `10080` */
    autoArchiveDuration: autoArchiveDurationSchema,
    /** whether the thread is locked; when a thread is locked, only users with `MANAGE_THREADS` can unarchive it */
    locked: z.boolean(),
    /** whether non-moderators can add other non-moderators to a thread; only available on private threads */
    invitable: z.boolean(),
    /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages`, `manage_thread`, or `manage_channel`, are unaffected */
    rateLimitPerUser: z.number().min(0).max(21600),
    /** channel flags combined as a bitfield; PINNED can only be set for threads in forum channels */
    flags: z.number().int().nullable(),
    /** the IDs of the set of tags that have been applied to a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel; limited to 5 */
    appliedTags: z.string().min(1).array().max(5).nullable()
  })
  .partial();

const groupDMOptions = sharedChannelOptions
  .extend({
    /** base64 encoded icon */
    icon: z.string().min(1)
  })
  .partial();

const guildChannelOptions = sharedChannelOptions
  .extend({
    /** the type of channel; only conversion between text and news is supported and only in guilds with the "NEWS" feature */
    type: channelTypeSchema,
    /** the position of the channel in the left-hand listing */
    position: z.number().optional(),
    /** 0-1024 character channel topic */
    topic: z.string().min(0).max(1024).optional(),
    /** whether the channel is nsfw */
    nsfw: z.boolean().optional(),
    /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission manage_messages or manage_channel, are unaffected */
    rateLimitPerUser: z.number().min(0).max(21600).optional(),
    /** the bitrate (in bits) of the voice or stage channel; min 8000 */
    bitrate: z.number().min(8000).optional(),
    /** the user limit of the voice or stage channel, max 99 for voice channels and 10,000 for stage channels (0 refers to no limit) */
    userLimit: z.number().min(0).max(10000).optional(),
    /** channel or category-specific permissions */
    permissionOverwrites: overwriteSchema.partial().array(),
    /** id of the new parent category for a channel */
    parentId: z.string().min(1),
    /** channel voice region id, automatic when set to null */
    rtcRegion: z.string().min(1).optional(),
    /** the camera video quality mode of the voice channel */
    videoQualityMode: videoQualityModeSchema,
    /** the default duration that the clients use (not the API) for newly created threads in the channel, in minutes, to automatically archive the thread after recent activity */
    defaultAutoArchiveDuration: autoArchiveDurationSchema,
    /** channel flags combined as a bitfield. Currently only `REQUIRE_TAG` (1 << 4) is supported by `GUILD_FORUM` and `GUILD_MEDIA` channels. `HIDE_MEDIA_DOWNLOAD_OPTIONS` (1 << 15) is supported only by `GUILD_MEDIA` channels */
    flags: z.number().int().nullable(),
    /** the set of tags that can be used in a GUILD_FORUM or a GUILD_MEDIA channel; limited to 20 */
    availableTags: forumTagSchema.array().max(20).nullable(),
    /** reaction object	the emoji to show in the add reaction button on a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
    defaultReactionEmoji: defaultReactionSchema.nullable().optional(),
    /** the initial `rateLimitPerUser` to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update */
    defaultThreadRateLimitPerUser: z.number().min(0).max(21600).nullable(),
    /** the default sort order type used to order posts in `GUILD_FORUM` and GUILD_MED`IA channels */
    defaultSortOrder: sortOrderTypeSchema.nullable().optional(),
    /** the default forum layout type used to display posts in `GUILD_FORUM` channels */
    defaultForumLayout: forumLayoutTypeSchema.nullable()
  })
  .partial();

export const modifyChannelSchema = z.object({
  channel: z.string().min(1),
  body: z.union([groupDMOptions, guildChannelOptions, threadOptions])
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

export const modifyChannelProcedure = toProcedure(
  `mutation`,
  modifyChannel,
  modifyChannelSchema,
  channelSchema
);
