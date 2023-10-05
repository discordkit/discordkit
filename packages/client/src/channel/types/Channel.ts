import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { autoArchiveDurationSchema } from "./AutoArchiveDuration.js";
import { channelTypeSchema } from "./ChannelType.js";
import { overwriteSchema } from "./Overwrite.js";
import { threadMetadataSchema } from "./ThreadMetadata.js";
import { threadMemberSchema } from "./ThreadMember.js";
import {
  VideoQualityMode,
  videoQualityModeSchema
} from "./VideoQualityMode.js";
import { forumTagSchema } from "./ForumTag.js";
import { defaultReactionSchema } from "./DefaultReaction.js";
import { sortOrderTypeSchema } from "./SortOrderType.js";
import { ForumLayoutType, forumLayoutTypeSchema } from "./ForumLayoutType.js";

// https://discord.com/developers/docs/resources/channel#channel-object-channel-structure
export const channelSchema = z.object({
  /** the id of this channel */
  id: snowflake,
  /** the type of channel */
  type: channelTypeSchema,
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: snowflake.nullish(),
  /** sorting position of the channel */
  position: z.number().positive().nullish(),
  /** explicit permission overwrites for members and roles */
  permissionOverwrites: overwriteSchema.array().nullish(),
  /** the name of the channel (1-100 characters) */
  name: z.string().min(1).max(100).nullish(),
  /** the channel topic (0-1024 characters) */
  topic: z.string().min(0).max(1024).nullish(),
  /** whether the channel is nsfw */
  nsfw: z.boolean().nullish(),
  /** the id of the last message sent in this channel (may not point to an existing or valid message) */
  lastMessageId: z.string().min(1).nullish(),
  /** the bitrate (in bits) of the voice channel */
  bitrate: z.number().int().positive().nullish(),
  /** the user limit of the voice channel */
  userLimit: z.number().int().positive().nullish(),
  /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages` or `manage_channel`, are unaffected */
  rateLimitPerUser: z.number().int().min(0).max(21600).nullish(),
  /** the recipients of the DM */
  recipients: userSchema.array().nullish(),
  /** icon hash of the group DM */
  icon: z.string().min(1).nullish(),
  /** id of the creator of the group DM or thread */
  ownerId: snowflake.nullish(),
  /** application id of the group DM creator if it is bot-created */
  applicationId: snowflake.nullish(),
  /** for group DM channels: whether the channel is managed by an application via the gdm.join OAuth2 scope */
  managed: z.boolean().nullish(),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: z.string().min(1).max(50).nullish(),
  /** when the last pinned message was pinned. This may be null in events such as `GUILD_CREATE` when a message is not pinned. */
  lastPinTimestamp: z.string().datetime().nullish(),
  /** voice region id for the voice channel, automatic when set to null */
  rtcRegion: z.string().min(1).optional(),
  /** the camera video quality mode of the voice channel, 1 when not present */
  videoQualityMode: videoQualityModeSchema
    .nullish()
    .default(VideoQualityMode.AUTO),
  /** an approximate count of messages in a thread, stops counting at 50 */
  messageCount: z.number().int().max(50).nullish(),
  /** an approximate count of users in a thread, stops counting at 50 */
  memberCount: z.number().int().max(50).nullish(),
  /** thread-specific fields not needed by other channels */
  threadMetadata: threadMetadataSchema.nullish(),
  /** thread member object for the current user, if they have joined the thread, only included on certain API endpoints */
  member: threadMemberSchema.nullish(),
  /** default duration that the clients (not the API) will use for newly created threads, in minutes, to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
  defaultAutoArchiveDuration: autoArchiveDurationSchema.nullish(),
  /** computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction */
  permissions: z.string().min(1).nullish(),
  /** channel flags combined as a bitfield */
  flags: z.number().int().nullish(),
  /** number of messages ever sent in a thread, it's similar to messageCount on message creation, but will not decrement the number when a message is deleted */
  totalMessageSent: z.number().int().positive().nullish(),
  /** the set of tags that can be used in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  availableTags: forumTagSchema.array().nullish(),
  /** the IDs of the set of tags that have been applied to a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  appliedTags: snowflake.array().nullish(),
  /** the emoji to show in the add reaction button on a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  defaultReactionEmoji: defaultReactionSchema.nullish(),
  /** the initial rateLimitPerUser to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update */
  defaultThreadRateLimitPerUser: z.number().int().positive().nullish(),
  /** the default sort order type used to order posts in `GUILD_FORUM` and `GUILD_MEDIA` channels. Defaults to null, which indicates a preferred sort order hasn't been set by a channel admin */
  defaultSortOrder: sortOrderTypeSchema.nullish().default(null),
  /** the default forum layout view used to display posts in `GUILD_FORUM` channels. Defaults to 0, which indicates a layout view has not been set by a channel admin */
  defaultForumLayout: forumLayoutTypeSchema
    .nullish()
    .default(ForumLayoutType.NOT_SET)
});

export type Channel = z.infer<typeof channelSchema>;
