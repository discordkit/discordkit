import { z } from "zod";
import type { Channel } from "../channel";
import {
  autoArchiveDuration,
  ChannelType,
  overwrite,
  VideoQualityMode
} from "../channel";
import { mutation, post } from "../utils";

export const createGuildChannelSchema = z.object({
  guild: z.string().min(1),
  body: z.object({
    /** channel name (1-100 characters) */
    name: z.string().min(1),
    /** the type of channel */
    type: z.nativeEnum(ChannelType).optional(),
    /** channel topic (0-1024 characters) */
    topic: z.string().min(0).max(1024).optional(),
    /** the bitrate (in bits) of the voice or stage channel; min 8000 */
    bitrate: z.number().min(8000).optional(),
    /** the user limit of the voice channel */
    userLimit: z.number().positive().optional(),
    /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission manage_messages or manage_channel, are unaffected */
    rateLimitPerYser: z.number().min(0).max(21600).optional(),
    /** sorting position of the channel */
    position: z.number().positive().optional(),
    /** the channel's permission overwrites */
    permissionOverwrites: z.array(overwrite.partial()).optional(),
    /** id of the parent category for a channel */
    parentId: z.string().min(1).optional(),
    /** whether the channel is nsfw */
    nsfw: z.boolean().optional(),
    /** channel voice region id of the voice or stage channel, automatic when set to null */
    rtcRegion: z.string().min(1).optional(),
    /** the camera video quality mode of the voice channel */
    videoQualityMode: z.nativeEnum(VideoQualityMode).optional(),
    /** the default duration that the clients use (not the API) for newly created threads in the channel, in minutes, to automatically archive the thread after recent activity */
    defaultAutoArchiveDuration: autoArchiveDuration
  })
});

/**
 * Create a new channel object for the guild. Requires the `MANAGE_CHANNELS` permission. If setting permission overwrites, only permissions your bot has in the guild can be allowed/denied. Setting `MANAGE_ROLES` permission in channels is only possible for guild administrators. Returns the new channel object on success. Fires a [Channel Create](https://discord.com/developers/docs/topics/gateway#channel-create) Gateway event.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#create-guild-channel
 */
export const createGuildChannel = mutation(
  createGuildChannelSchema,
  async ({ guild, body }) => post<Channel>(`/guilds/${guild}/channels`, body)
);
