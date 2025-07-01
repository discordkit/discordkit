import * as v from "valibot";
import { snowflake, asDigits, asInteger } from "@discordkit/core";
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
  id: snowflake as v.GenericSchema<string>,
  /** the type of channel */
  type: channelTypeSchema,
  /** explicit permission overwrites for members and roles */
  permissionOverwrites: v.exactOptional(v.array(overwriteSchema)),
  /** the name of the channel (1-100 characters) */
  name: v.nullish<v.GenericSchema<string>>(
    v.pipe(v.string(), v.minLength(1), v.maxLength(100))
  ),
  /** the channel topic (0-4096 characters for GUILD_FORUM and GUILD_MEDIA channels, 0-1024 characters for all others) */
  topic: v.nullish<v.GenericSchema<string>>(
    v.pipe(v.string(), v.minLength(0), v.maxLength(1024))
  ),
  /** whether the channel is nsfw */
  nsfw: v.exactOptional(v.boolean()),
  /** the id of the last message sent in this channel (may not point to an existing or valid message) */
  lastMessageId: v.nullish<v.GenericSchema<string>>(snowflake),
  /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages` or `manage_channel`, are unaffected */
  rateLimitPerUser: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(21600))
  ),
  /** when the last pinned message was pinned. This may be null in events such as `GUILD_CREATE` when a message is not pinned. */
  lastPinTimestamp: v.nullish<v.GenericSchema<string>>(
    v.pipe(v.string(), v.isoTimestamp())
  ),
  /** computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction */
  permissions: v.exactOptional(
    asDigits(permissionFlag) as v.GenericSchema<string>
  ),
  /** channel flags combined as a bitfield */
  flags: v.exactOptional(asInteger(channelFlag) as v.GenericSchema<number>)
});

export const guildOrganizationChannelSchema = v.object({
  ...commonChannelSchema.entries,
  type: v.picklist([ChannelType.GUILD_CATEGORY, ChannelType.GUILD_DIRECTORY]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: v.exactOptional<v.GenericSchema<string>>(snowflake),
  /** sorting position of the channel */
  position: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.minValue(0))
  )
});

export const guildTextChannelSchema = v.object({
  ...commonChannelSchema.entries,
  type: v.picklist([ChannelType.GUILD_ANNOUNCEMENT, ChannelType.GUILD_TEXT]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: v.exactOptional<v.GenericSchema<string>>(snowflake),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: v.nullish<v.GenericSchema<string>>(snowflake),
  /** sorting position of the channel */
  position: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.minValue(0))
  )
});

export const guildVoiceChannelSchema = v.object({
  ...commonChannelSchema.entries,
  /** the type of channel */
  type: v.picklist([ChannelType.GUILD_STAGE_VOICE, ChannelType.GUILD_VOICE]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: v.exactOptional<v.GenericSchema<string>>(snowflake),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: v.nullish<v.GenericSchema<string>>(snowflake),
  /** sorting position of the channel */
  position: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.minValue(0))
  ),
  /** the bitrate (in bits) of the voice channel */
  bitrate: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.minValue(0))
  ),
  /** the user limit of the voice channel */
  userLimit: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.minValue(0))
  ),
  /** voice region id for the voice channel, automatic when set to null */
  rtcRegion: v.nullish<v.GenericSchema<string>>(
    v.pipe(v.string(), v.minLength(1))
  ),
  /** the camera video quality mode of the voice channel, 1 when not present */
  videoQualityMode: v.exactOptional(videoQualityModeSchema)
});

export const guildForumChannelSchema = v.object({
  ...commonChannelSchema.entries,
  type: v.picklist([ChannelType.GUILD_FORUM, ChannelType.GUILD_MEDIA]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: v.exactOptional<v.GenericSchema<string>>(snowflake),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: v.nullish<v.GenericSchema<string>>(snowflake),
  /** sorting position of the channel */
  position: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.minValue(0))
  ),
  /** the channel topic (0-4096 characters for GUILD_FORUM and GUILD_MEDIA channels, 0-1024 characters for all others) */
  topic: v.nullish<v.GenericSchema<string>>(
    v.pipe(v.string(), v.minLength(0), v.maxLength(4096))
  ),
  /** the set of tags that can be used in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  availableTags: v.exactOptional(v.array(forumTagSchema)),
  /** the emoji to show in the add reaction button on a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  defaultReactionEmoji: v.nullish(defaultReactionSchema),
  /** the default sort order type used to order posts in `GUILD_FORUM` and `GUILD_MEDIA` channels. Defaults to null, which indicates a preferred sort order hasn't been set by a channel admin */
  defaultSortOrder: v.nullish(sortOrderTypeSchema),
  /** the default forum layout view used to display posts in `GUILD_FORUM` channels. Defaults to 0, which indicates a layout view has not been set by a channel admin */
  defaultForumLayout: v.exactOptional(forumLayoutTypeSchema)
});

export const threadChannelSchema = v.object({
  ...commonChannelSchema.entries,
  type: v.picklist([
    ChannelType.ANNOUNCEMENT_THREAD,
    ChannelType.PRIVATE_THREAD,
    ChannelType.PUBLIC_THREAD
  ]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: v.exactOptional<v.GenericSchema<string>>(snowflake),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: v.nullish<v.GenericSchema<string>>(snowflake),
  /** id of the creator of the group DM or thread */
  ownerId: v.exactOptional<v.GenericSchema<string>>(snowflake),
  /** sorting position of the channel */
  position: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.minValue(0))
  ),
  /** an approximate count of messages in a thread, stops counting at 50 */
  messageCount: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.maxValue(50))
  ),
  /** an approximate count of users in a thread, stops counting at 50 */
  memberCount: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.maxValue(50))
  ),
  /** thread-specific fields not needed by other channels */
  threadMetadata: v.exactOptional(threadMetadataSchema),
  /** the IDs of the set of tags that have been applied to a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  appliedTags: v.exactOptional<v.GenericSchema<string[]>>(v.array(snowflake)),
  /** thread member object for the current user, if they have joined the thread, only included on certain API endpoints */
  member: v.exactOptional(threadMemberSchema),
  /** default duration that the clients (not the API) will use for newly created threads, in minutes, to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
  defaultAutoArchiveDuration: v.exactOptional(autoArchiveDurationSchema),
  /** number of messages ever sent in a thread, it's similar to messageCount on message creation, but will not decrement the number when a message is deleted */
  totalMessageSent: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.minValue(0))
  ),
  /** the initial rateLimitPerUser to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update */
  defaultThreadRateLimitPerUser: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.minValue(0))
  )
});

export const directMessageChannelSchema = v.object({
  ...commonChannelSchema.entries,
  type: v.literal(ChannelType.DM),
  /** the recipients of the DM */
  recipients: v.exactOptional<v.GenericSchema<User[]>>(v.array(userSchema))
});

export const groupDirectMessageChannelSchema = v.object({
  ...commonChannelSchema.entries,
  type: v.literal(ChannelType.GROUP_DM),
  /** the recipients of the DM */
  recipients: v.exactOptional<v.GenericSchema<User[]>>(v.array(userSchema)),
  /** icon hash of the group DM */
  icon: v.nullish<v.GenericSchema<string>>(v.pipe(v.string(), v.minLength(1))),
  /** id of the creator of the group DM or thread */
  ownerId: v.exactOptional<v.GenericSchema<string>>(snowflake),
  /** application id of the group DM creator if it is bot-created */
  applicationId: v.exactOptional<v.GenericSchema<string>>(snowflake),
  /** for group DM channels: whether the channel is managed by an application via the gdm.join OAuth2 scope */
  managed: v.exactOptional(v.boolean())
});

export type Channel =
  | v.InferOutput<typeof guildOrganizationChannelSchema>
  | v.InferOutput<typeof guildTextChannelSchema>
  | v.InferOutput<typeof guildVoiceChannelSchema>
  | v.InferOutput<typeof guildForumChannelSchema>
  | v.InferOutput<typeof threadChannelSchema>
  | v.InferOutput<typeof directMessageChannelSchema>
  | v.InferOutput<typeof groupDirectMessageChannelSchema>;

// https://discord.com/developers/docs/resources/channel#channel-object-channel-structure
export const channelSchema = v.variant(`type`, [
  guildOrganizationChannelSchema,
  guildTextChannelSchema,
  guildVoiceChannelSchema,
  guildForumChannelSchema,
  threadChannelSchema,
  directMessageChannelSchema,
  groupDirectMessageChannelSchema
]) as v.GenericSchema<Channel>;

export const partialChannelSchema = v.variant(`type`, [
  v.required(v.partial(guildOrganizationChannelSchema), [`type`]),
  v.required(v.partial(guildTextChannelSchema), [`type`]),
  v.required(v.partial(guildVoiceChannelSchema), [`type`]),
  v.required(v.partial(guildForumChannelSchema), [`type`]),
  v.required(v.partial(threadChannelSchema), [`type`]),
  v.required(v.partial(directMessageChannelSchema), [`type`]),
  v.required(v.partial(groupDirectMessageChannelSchema), [`type`])
]);
