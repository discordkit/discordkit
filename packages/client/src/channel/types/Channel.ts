import * as v from "valibot";
import {
  snowflake,
  asDigits,
  asInteger,
  timestamp,
  boundedInteger,
  boundedString
} from "@discordkit/core";
import { type User, userSchema } from "../../user/types/User.js";
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

export const commonChannelSchema = v.object({
  /** the id of this channel */
  id: snowflake,
  /** the type of channel */
  type: channelTypeSchema,
  /** explicit permission overwrites for members and roles */
  permissionOverwrites: v.exactOptional(v.array(overwriteSchema)),
  /** the name of the channel (1-100 characters) */
  name: v.nullish(boundedString({ max: 100 })),
  /** the channel topic (0-4096 characters for GUILD_FORUM and GUILD_MEDIA channels, 0-1024 characters for all others) */
  topic: v.nullish(boundedString({ max: 1024 })),
  /** whether the channel is nsfw */
  nsfw: v.exactOptional(v.boolean()),
  /** the id of the last message sent in this channel (may not point to an existing or valid message) */
  lastMessageId: v.nullish(snowflake),
  /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages` or `manage_channel`, are unaffected */
  rateLimitPerUser: v.exactOptional(boundedInteger({ max: 21600 })),
  /** when the last pinned message was pinned. This may be null in events such as `GUILD_CREATE` when a message is not pinned. */
  lastPinTimestamp: v.nullish(timestamp),
  /** computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction */
  permissions: v.exactOptional(asDigits(permissionFlag)),
  /** channel flags combined as a bitfield */
  flags: v.exactOptional(asInteger(channelFlag))
});

export const guildOrganizationChannelSchema = v.object({
  ...commonChannelSchema.entries,
  type: v.picklist([ChannelType.GUILD_CATEGORY, ChannelType.GUILD_DIRECTORY]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: v.exactOptional(snowflake),
  /** sorting position of the channel */
  position: v.exactOptional(boundedInteger())
});

export type GuildOrganizationChannel = v.InferOutput<
  typeof guildOrganizationChannelSchema
>;

export const guildTextChannelSchema = v.object({
  ...commonChannelSchema.entries,
  type: v.picklist([ChannelType.GUILD_ANNOUNCEMENT, ChannelType.GUILD_TEXT]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: v.exactOptional(snowflake),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: v.nullish(snowflake),
  /** sorting position of the channel */
  position: v.exactOptional(boundedInteger())
});

export type GuildTextChannel = v.InferOutput<typeof guildTextChannelSchema>;

export const guildVoiceChannelSchema = v.object({
  ...commonChannelSchema.entries,
  /** the type of channel */
  type: v.picklist([ChannelType.GUILD_STAGE_VOICE, ChannelType.GUILD_VOICE]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: v.exactOptional(snowflake),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: v.nullish(snowflake),
  /** sorting position of the channel */
  position: v.exactOptional(boundedInteger()),
  /** the bitrate (in bits) of the voice channel */
  bitrate: v.exactOptional(boundedInteger()),
  /** the user limit of the voice channel */
  userLimit: v.exactOptional(boundedInteger()),
  /** voice region id for the voice channel, automatic when set to null */
  rtcRegion: v.nullish(boundedString()),
  /** the camera video quality mode of the voice channel, 1 when not present */
  videoQualityMode: v.exactOptional(videoQualityModeSchema)
});

export type GuildVoiceChannel = v.InferOutput<typeof guildVoiceChannelSchema>;

export const guildForumChannelSchema = v.object({
  ...commonChannelSchema.entries,
  type: v.picklist([ChannelType.GUILD_FORUM, ChannelType.GUILD_MEDIA]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: v.exactOptional(snowflake),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: v.nullish(snowflake),
  /** sorting position of the channel */
  position: v.exactOptional(boundedInteger()),
  /** the channel topic (0-4096 characters for GUILD_FORUM and GUILD_MEDIA channels, 0-1024 characters for all others) */
  topic: v.nullish(boundedString({ max: 4096 })),
  /** the set of tags that can be used in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  availableTags: v.exactOptional(v.array(forumTagSchema)),
  /** the emoji to show in the add reaction button on a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  defaultReactionEmoji: v.nullish(defaultReactionSchema),
  /** the default sort order type used to order posts in `GUILD_FORUM` and `GUILD_MEDIA` channels. Defaults to null, which indicates a preferred sort order hasn't been set by a channel admin */
  defaultSortOrder: v.nullish(sortOrderTypeSchema),
  /** the default forum layout view used to display posts in `GUILD_FORUM` channels. Defaults to 0, which indicates a layout view has not been set by a channel admin */
  defaultForumLayout: v.exactOptional(forumLayoutTypeSchema)
});

export type GuildForumChannel = v.InferOutput<typeof guildForumChannelSchema>;

export const threadChannelSchema = v.object({
  ...commonChannelSchema.entries,
  type: v.picklist([
    ChannelType.ANNOUNCEMENT_THREAD,
    ChannelType.PRIVATE_THREAD,
    ChannelType.PUBLIC_THREAD
  ]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: v.exactOptional(snowflake),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: v.nullish(snowflake),
  /** id of the creator of the group DM or thread */
  ownerId: v.exactOptional(snowflake),
  /** sorting position of the channel */
  position: v.exactOptional(boundedInteger()),
  /** an approximate count of messages in a thread, stops counting at 50 */
  messageCount: v.exactOptional(boundedInteger({ max: 50 })),
  /** an approximate count of users in a thread, stops counting at 50 */
  memberCount: v.exactOptional(boundedInteger({ max: 50 })),
  /** thread-specific fields not needed by other channels */
  threadMetadata: v.exactOptional(threadMetadataSchema),
  /** the IDs of the set of tags that have been applied to a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  appliedTags: v.exactOptional<v.GenericSchema<string[]>>(v.array(snowflake)),
  /** thread member object for the current user, if they have joined the thread, only included on certain API endpoints */
  member: v.exactOptional(threadMemberSchema),
  /** default duration that the clients (not the API) will use for newly created threads, in minutes, to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
  defaultAutoArchiveDuration: v.exactOptional(autoArchiveDurationSchema),
  /** number of messages ever sent in a thread, it's similar to messageCount on message creation, but will not decrement the number when a message is deleted */
  totalMessageSent: v.exactOptional(boundedInteger()),
  /** the initial rateLimitPerUser to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update */
  defaultThreadRateLimitPerUser: v.exactOptional(boundedInteger())
});

export type ThreadChannel = v.InferOutput<typeof threadChannelSchema>;

export const directMessageChannelSchema = v.object({
  ...commonChannelSchema.entries,
  type: v.literal(ChannelType.DM),
  /** the recipients of the DM */
  recipients: v.exactOptional<v.GenericSchema<User[]>>(v.array(userSchema))
});

export type DirectMessageChannel = v.InferOutput<
  typeof directMessageChannelSchema
>;

export const groupDirectMessageChannelSchema = v.object({
  ...commonChannelSchema.entries,
  type: v.literal(ChannelType.GROUP_DM),
  /** the recipients of the DM */
  recipients: v.exactOptional<v.GenericSchema<User[]>>(v.array(userSchema)),
  /** icon hash of the group DM */
  icon: v.nullish(boundedString()),
  /** id of the creator of the group DM or thread */
  ownerId: v.exactOptional(snowflake),
  /** application id of the group DM creator if it is bot-created */
  applicationId: v.exactOptional(snowflake),
  /** for group DM channels: whether the channel is managed by an application via the gdm.join OAuth2 scope */
  managed: v.exactOptional(v.boolean())
});

export type GroupDirectMessageChannel = v.InferOutput<
  typeof groupDirectMessageChannelSchema
>;

export type Channel =
  | GuildOrganizationChannel
  | GuildTextChannel
  | GuildVoiceChannel
  | GuildForumChannel
  | ThreadChannel
  | DirectMessageChannel
  | GroupDirectMessageChannel;

// https://discord.com/developers/docs/resources/channel#channel-object-channel-structure
export const channelSchema = v.union([
  guildOrganizationChannelSchema,
  guildTextChannelSchema,
  guildVoiceChannelSchema,
  guildForumChannelSchema,
  threadChannelSchema,
  directMessageChannelSchema,
  groupDirectMessageChannelSchema
]) as v.GenericSchema<Channel>;

type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

export const partialChannelSchema = v.union([
  v.required(v.partial(guildOrganizationChannelSchema), [`type`]),
  v.required(v.partial(guildTextChannelSchema), [`type`]),
  v.required(v.partial(guildVoiceChannelSchema), [`type`]),
  v.required(v.partial(guildForumChannelSchema), [`type`]),
  v.required(v.partial(threadChannelSchema), [`type`]),
  v.required(v.partial(directMessageChannelSchema), [`type`]),
  v.required(v.partial(groupDirectMessageChannelSchema), [`type`])
]) as v.GenericSchema<PartialExcept<Channel, `type`>>;
