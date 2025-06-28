import {
  object,
  nullish,
  string,
  minLength,
  number,
  boolean,
  minValue,
  integer,
  array,
  maxLength,
  maxValue,
  type InferOutput,
  isoTimestamp,
  pipe,
  exactOptional,
  literal,
  picklist,
  variant
} from "valibot";
import { snowflake, asDigits, asInteger } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { autoArchiveDurationSchema } from "./AutoArchiveDuration.js";
import { ChannelType, channelTypeSchema } from "./ChannelType.js";
import { overwriteSchema } from "./Overwrite.js";
import { threadMetadataSchema } from "./ThreadMetadata.js";
import { threadMemberSchema } from "./ThreadMember.js";
import { videoQualityModeSchema } from "./VideoQualityMode.js";
import { forumTagSchema } from "./ForumTag.js";
import { defaultReactionSchema } from "./DefaultReaction.js";
import { sortOrderTypeSchema } from "./SortOrderType.js";
import { forumLayoutTypeSchema } from "./ForumLayoutType.js";
import { channelFlag } from "./ChannelFlags.js";
import { permissionFlag } from "../../permissions/Permissions.js";

export const commonChannelSchema = object({
  /** the id of this channel */
  id: snowflake,
  /** the type of channel */
  type: channelTypeSchema,
  /** explicit permission overwrites for members and roles */
  permissionOverwrites: exactOptional(array(overwriteSchema)),
  /** the name of the channel (1-100 characters) */
  name: nullish(pipe(string(), minLength(1), maxLength(100))),
  /** the channel topic (0-4096 characters for GUILD_FORUM and GUILD_MEDIA channels, 0-1024 characters for all others) */
  topic: nullish(pipe(string(), minLength(0), maxLength(1024))),
  /** whether the channel is nsfw */
  nsfw: exactOptional(boolean()),
  /** the id of the last message sent in this channel (may not point to an existing or valid message) */
  lastMessageId: nullish(snowflake),
  /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages` or `manage_channel`, are unaffected */
  rateLimitPerUser: exactOptional(
    pipe(number(), integer(), minValue(0), maxValue(21600))
  ),
  /** when the last pinned message was pinned. This may be null in events such as `GUILD_CREATE` when a message is not pinned. */
  lastPinTimestamp: nullish(pipe(string(), isoTimestamp())),
  /** computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction */
  permissions: exactOptional(asDigits(permissionFlag)),
  /** channel flags combined as a bitfield */
  flags: exactOptional(asInteger(channelFlag))
});

export const guildTextChannelSchema = object({
  ...commonChannelSchema.entries,
  type: picklist([
    ChannelType.GUILD_ANNOUNCEMENT,
    ChannelType.GUILD_CATEGORY,
    ChannelType.GUILD_DIRECTORY,
    ChannelType.GUILD_TEXT
  ]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: exactOptional(snowflake),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: nullish(snowflake),
  /** sorting position of the channel */
  position: exactOptional(pipe(number(), minValue(0)))
});

export const guildVoiceChannelSchema = object({
  ...commonChannelSchema.entries,
  /** the type of channel */
  type: picklist([ChannelType.GUILD_STAGE_VOICE, ChannelType.GUILD_VOICE]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: exactOptional(snowflake),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: nullish(snowflake),
  /** sorting position of the channel */
  position: exactOptional(pipe(number(), minValue(0))),
  /** the bitrate (in bits) of the voice channel */
  bitrate: exactOptional(pipe(number(), integer(), minValue(0))),
  /** the user limit of the voice channel */
  userLimit: exactOptional(pipe(number(), integer(), minValue(0))),
  /** voice region id for the voice channel, automatic when set to null */
  rtcRegion: nullish(pipe(string(), minLength(1))),
  /** the camera video quality mode of the voice channel, 1 when not present */
  videoQualityMode: exactOptional(videoQualityModeSchema)
});

export const guildForumChannelSchema = object({
  ...commonChannelSchema.entries,
  type: picklist([ChannelType.GUILD_FORUM, ChannelType.GUILD_MEDIA]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: exactOptional(snowflake),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: nullish(snowflake),
  /** sorting position of the channel */
  position: exactOptional(pipe(number(), minValue(0))),
  /** the channel topic (0-4096 characters for GUILD_FORUM and GUILD_MEDIA channels, 0-1024 characters for all others) */
  topic: nullish(pipe(string(), minLength(0), maxLength(4096))),
  /** the set of tags that can be used in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  availableTags: exactOptional(array(forumTagSchema)),
  /** the emoji to show in the add reaction button on a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  defaultReactionEmoji: nullish(defaultReactionSchema),
  /** the default sort order type used to order posts in `GUILD_FORUM` and `GUILD_MEDIA` channels. Defaults to null, which indicates a preferred sort order hasn't been set by a channel admin */
  defaultSortOrder: nullish(sortOrderTypeSchema),
  /** the default forum layout view used to display posts in `GUILD_FORUM` channels. Defaults to 0, which indicates a layout view has not been set by a channel admin */
  defaultForumLayout: exactOptional(forumLayoutTypeSchema)
});

export const threadChannelSchema = object({
  ...commonChannelSchema.entries,
  type: picklist([
    ChannelType.ANNOUNCEMENT_THREAD,
    ChannelType.PRIVATE_THREAD,
    ChannelType.PUBLIC_THREAD
  ]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: exactOptional(snowflake),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: nullish(snowflake),
  /** id of the creator of the group DM or thread */
  ownerId: exactOptional(snowflake),
  /** sorting position of the channel */
  position: exactOptional(pipe(number(), minValue(0))),
  /** an approximate count of messages in a thread, stops counting at 50 */
  messageCount: exactOptional(pipe(number(), integer(), maxValue(50))),
  /** an approximate count of users in a thread, stops counting at 50 */
  memberCount: exactOptional(pipe(number(), integer(), maxValue(50))),
  /** thread-specific fields not needed by other channels */
  threadMetadata: exactOptional(threadMetadataSchema),
  /** the IDs of the set of tags that have been applied to a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  appliedTags: exactOptional(array(snowflake)),
  /** thread member object for the current user, if they have joined the thread, only included on certain API endpoints */
  member: exactOptional(threadMemberSchema),
  /** default duration that the clients (not the API) will use for newly created threads, in minutes, to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
  defaultAutoArchiveDuration: exactOptional(autoArchiveDurationSchema),
  /** number of messages ever sent in a thread, it's similar to messageCount on message creation, but will not decrement the number when a message is deleted */
  totalMessageSent: exactOptional(pipe(number(), integer(), minValue(0))),
  /** the initial rateLimitPerUser to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update */
  defaultThreadRateLimitPerUser: exactOptional(
    pipe(number(), integer(), minValue(0))
  )
});

export const directMessageChannelSchema = object({
  ...commonChannelSchema.entries,
  type: literal(ChannelType.DM),
  /** the recipients of the DM */
  recipients: exactOptional(array(userSchema))
});

export const groupDirectMessageChannelSchema = object({
  ...commonChannelSchema.entries,
  type: literal(ChannelType.GROUP_DM),
  /** the recipients of the DM */
  recipients: exactOptional(array(userSchema)),
  /** icon hash of the group DM */
  icon: nullish(pipe(string(), minLength(1))),
  /** id of the creator of the group DM or thread */
  ownerId: exactOptional(snowflake),
  /** application id of the group DM creator if it is bot-created */
  applicationId: exactOptional(snowflake),
  /** for group DM channels: whether the channel is managed by an application via the gdm.join OAuth2 scope */
  managed: exactOptional(boolean())
});

// https://discord.com/developers/docs/resources/channel#channel-object-channel-structure
export const channelSchema = variant(`type`, [
  guildTextChannelSchema,
  guildVoiceChannelSchema,
  guildForumChannelSchema,
  threadChannelSchema,
  directMessageChannelSchema,
  groupDirectMessageChannelSchema
]);

export type Channel = InferOutput<typeof channelSchema>;
