import { z } from "zod";
import { mutation, patch } from "../utils";
import type { Channel } from "./types";
import { autoArchiveDuration, ChannelType, VideoQualityMode } from "./types";

const sharedChannelOptions = z.object({
  /** 1-100 character channel name */
  name: z.string().min(1).max(100)
});

const threadOptions = sharedChannelOptions
  .extend({
    /** whether the thread is archived */
    archived: z.boolean(),
    /** duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
    autoArchiveDuration,
    /** whether the thread is locked; when a thread is locked, only users with MANAGE_THREADS can unarchive it */
    locked: z.boolean(),
    /** whether non-moderators can add other non-moderators to a thread; only available on private threads */
    invitable: z.boolean(),
    /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission manage_messages, manage_thread, or manage_channel, are unaffected */
    rateLimitPerUser: z.number().min(0).max(21600),
    /** channel flags combined as a bitfield; PINNED can only be set for threads in forum channels */
    flags: z.number()
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
    type: z.nativeEnum(ChannelType),
    /** the position of the channel in the left-hand listing */
    position: z.number(),
    /** 0-1024 character channel topic */
    topic: z.string().min(0).max(1024),
    /** whether the channel is nsfw */
    nsfw: z.boolean(),
    /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission manage_messages or manage_channel, are unaffected */
    rateLimitPerUser: z.number().min(0).max(21600),
    /** the bitrate (in bits) of the voice or stage channel; min 8000 */
    bitrate: z.number().min(8000),
    /** the user limit of the voice channel; 0 refers to no limit, 1 to 99 refers to a user limit */
    userLimit: z.number().min(0).max(99),
    /** channel or category-specific permissions */
    permissionOverwrites: z.array(
      z
        .object({
          /** role or user id */
          id: z.string().min(1),
          /** either 0 (role) or 1 (member) */
          type: z.union([z.literal(0), z.literal(1)]),
          /** permission bit set */
          allow: z.string().min(1),
          /** permission bit set */
          deny: z.string().min(1)
        })
        .partial()
    ),
    /** id of the new parent category for a channel */
    parentId: z.string().min(1),
    /** channel voice region id, automatic when set to null */
    rtcRegion: z.string().min(1).nullable(),
    /** the camera video quality mode of the voice channel */
    videoQualityMode: z.nativeEnum(VideoQualityMode),
    /** the default duration that the clients use (not the API) for newly created threads in the channel, in minutes, to automatically archive the thread after recent activity */
    defaultAutoArchiveDuration: autoArchiveDuration
  })
  .partial();

export const modifyChannelSchema = z.object({
  channel: z.string().min(1),
  body: z.union([groupDMOptions, guildChannelOptions, threadOptions])
});

/**
 * Update a channel's settings. Returns a channel on success, and a 400 BAD REQUEST on invalid parameters.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/channel#modify-channel
 */
export const modifyChannel = mutation(modifyChannelSchema, async ({ channel, body }) =>
  patch<Channel>(`/channels/${channel}`, body)
);
