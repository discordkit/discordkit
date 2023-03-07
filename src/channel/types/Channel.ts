import { z } from "zod";
import { user } from "../../user";
import { autoArchiveDuration } from "./AutoArchiveDuration";
import { ChannelType } from "./ChannelType";
import { overwrite } from "./Overwrite";
import { thread } from "./Thread";
import { threadMember } from "./ThreadMember";
import { VideoQualityMode } from "./VideoQualityMode";

// https://discord.com/developers/docs/resources/channel#channel-object-channel-structure
export const channel = z.object({
  /** the id of this channel */
  id: z.string().min(1),
  /** the type of channel */
  type: z.nativeEnum(ChannelType),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: z.string().min(1).optional(),
  /** sorting position of the channel */
  position: z.number().positive().optional(),
  /** explicit permission overwrites for members and roles */
  permissionOverwrites: z.array(overwrite).optional(),
  /** the name of the channel (1-100 characters) */
  name: z.string().min(1).max(100).optional(),
  /** the channel topic (0-1024 characters) */
  topic: z.string().min(0).max(1024).optional(),
  /** whether the channel is nsfw */
  nsfw: z.boolean().optional(),
  /** the id of the last message sent in this channel (may not point to an existing or valid message) */
  lastMessageId: z.string().min(1).optional(),
  /** the bitrate (in bits) of the voice channel */
  bitrate: z.number().positive().optional(),
  /** the user limit of the voice channel */
  userLimit: z.number().positive().optional(),
  /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission manage_messages or manage_channel, are unaffected */
  rateLimitPerUser: z.number().min(0).max(21600).optional(),
  /** the recipients of the DM */
  recipients: z.array(user).optional(),
  /** icon hash of the group DM */
  icon: z.string().min(1).optional(),
  /** id of the creator of the group DM or thread */
  ownerId: z.string().min(1).optional(),
  /** application id of the group DM creator if it is bot-created */
  applicationId: z.string().min(1).optional(),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: z.string().min(1).max(50).optional(),
  /** when the last pinned message was pinned. This may be null in events such as GUILD_CREATE when a message is not pinned. */
  lastPinTimestamp: z.number().optional(),
  /** voice region id for the voice channel, automatic when set to null */
  rtcRegion: z.string().min(1).optional(),
  /** the camera video quality mode of the voice channel, 1 when not present */
  videoQualityMode: z.nativeEnum(VideoQualityMode).optional(),
  /** an approximate count of messages in a thread, stops counting at 50 */
  messageCount: z.number().optional(),
  /** an approximate count of users in a thread, stops counting at 50 */
  memberCount: z.number().optional(),
  /** thread-specific fields not needed by other channels */
  threadMetadata: thread.optional(),
  /** thread member object for the current user, if they have joined the thread, only included on certain API endpoints */
  member: threadMember.optional(),
  /** default duration that the clients (not the API) will use for newly created threads, in minutes, to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
  defaultAutoArchiveDuration: autoArchiveDuration.optional(),
  /** computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction */
  permissions: z.string().min(1).optional()
});

export type Channel = z.infer<typeof channel>;
