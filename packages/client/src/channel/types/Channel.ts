import * as v from "valibot";
import {
  snowflake,
  schema,
  variantSchema,
  asDigits,
  asInteger,
  timestamp,
  boundedInteger,
  boundedString
} from "@discordkit/core";
import { type User, userSchema } from "../../user/types/User.js";
import { autoArchiveDurationSchema } from "./AutoArchiveDuration.js";
import { ChannelType } from "./ChannelType.js";
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

const _commonChannelSchema = v.object({
  /** the id of this channel */
  id: snowflake,
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

type CommonChannelFields = v.InferOutput<typeof _commonChannelSchema>;

const _guildOrganizationChannelVariantSchema = v.object({
  /** the type of channel */
  type: v.picklist([ChannelType.GUILD_CATEGORY, ChannelType.GUILD_DIRECTORY]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: v.exactOptional(snowflake),
  /** sorting position of the channel */
  position: v.exactOptional(boundedInteger())
});

export interface GuildOrganizationChannel
  extends
    CommonChannelFields,
    v.InferOutput<typeof _guildOrganizationChannelVariantSchema> {}

export const guildOrganizationChannelSchema = schema<GuildOrganizationChannel>(
  v.intersect([_commonChannelSchema, _guildOrganizationChannelVariantSchema])
);

const _guildTextChannelVariantSchema = v.object({
  /** the type of channel */
  type: v.picklist([ChannelType.GUILD_ANNOUNCEMENT, ChannelType.GUILD_TEXT]),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: v.exactOptional(snowflake),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: v.nullish(snowflake),
  /** sorting position of the channel */
  position: v.exactOptional(boundedInteger())
});

export interface GuildTextChannel
  extends
    CommonChannelFields,
    v.InferOutput<typeof _guildTextChannelVariantSchema> {}

export const guildTextChannelSchema = schema<GuildTextChannel>(
  v.intersect([_commonChannelSchema, _guildTextChannelVariantSchema])
);

/**
 * Entries map for {@link guildTextChannelSchema}, re-exported so callers
 * that need to extend the schema by spreading its fields can do so —
 * `guildTextChannelSchema.entries` is unavailable because the annotated
 * schema deliberately hides the `ObjectSchema` shape.
 */
export const guildTextChannelEntries = {
  ..._commonChannelSchema.entries,
  ..._guildTextChannelVariantSchema.entries
};

const _guildVoiceChannelVariantSchema = v.object({
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
  /** {@link VoiceRegion | voice region} id for the voice channel, automatic when set to null */
  rtcRegion: v.nullish(boundedString()),
  /** the camera video quality mode of the voice channel, 1 when not present */
  videoQualityMode: v.exactOptional(videoQualityModeSchema)
});

export interface GuildVoiceChannel
  extends
    CommonChannelFields,
    v.InferOutput<typeof _guildVoiceChannelVariantSchema> {}

export const guildVoiceChannelSchema = schema<GuildVoiceChannel>(
  v.intersect([_commonChannelSchema, _guildVoiceChannelVariantSchema])
);

const _guildForumChannelVariantSchema = v.object({
  /** the type of channel */
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

export interface GuildForumChannel
  extends
    Omit<CommonChannelFields, `topic`>,
    v.InferOutput<typeof _guildForumChannelVariantSchema> {}

export const guildForumChannelSchema = schema<GuildForumChannel>(
  v.intersect([_commonChannelSchema, _guildForumChannelVariantSchema])
);

const _threadChannelVariantSchema = v.object({
  /** the type of channel */
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
  /** {@link ThreadMember | thread member object} for the current user, if they have joined the thread, only included on certain API endpoints */
  member: v.exactOptional(threadMemberSchema),
  /** default duration that the clients (not the API) will use for newly created threads, in minutes, to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
  defaultAutoArchiveDuration: v.exactOptional(autoArchiveDurationSchema),
  /** number of messages ever sent in a thread, it's similar to messageCount on message creation, but will not decrement the number when a message is deleted */
  totalMessageSent: v.exactOptional(boundedInteger()),
  /** the initial rateLimitPerUser to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update */
  defaultThreadRateLimitPerUser: v.exactOptional(boundedInteger())
});

export interface ThreadChannel
  extends
    CommonChannelFields,
    v.InferOutput<typeof _threadChannelVariantSchema> {}

export const threadChannelSchema = schema<ThreadChannel>(
  v.intersect([_commonChannelSchema, _threadChannelVariantSchema])
);

/** Entries map for {@link threadChannelSchema}; see {@link guildTextChannelEntries}. */
export const threadChannelEntries = {
  ..._commonChannelSchema.entries,
  ..._threadChannelVariantSchema.entries
};

const _directMessageChannelVariantSchema = v.object({
  /** the type of channel */
  type: v.literal(ChannelType.DM),
  /** the recipients of the DM */
  recipients: v.exactOptional<v.GenericSchema<User[]>>(v.array(userSchema))
});

export interface DirectMessageChannel
  extends
    CommonChannelFields,
    v.InferOutput<typeof _directMessageChannelVariantSchema> {}

export const directMessageChannelSchema = schema<DirectMessageChannel>(
  v.intersect([_commonChannelSchema, _directMessageChannelVariantSchema])
);

const _groupDirectMessageChannelVariantSchema = v.object({
  /** the type of channel */
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

export interface GroupDirectMessageChannel
  extends
    CommonChannelFields,
    v.InferOutput<typeof _groupDirectMessageChannelVariantSchema> {}

export const groupDirectMessageChannelSchema =
  schema<GroupDirectMessageChannel>(
    v.intersect([_commonChannelSchema, _groupDirectMessageChannelVariantSchema])
  );

export type Channel =
  | GuildOrganizationChannel
  | GuildTextChannel
  | GuildVoiceChannel
  | GuildForumChannel
  | ThreadChannel
  | DirectMessageChannel
  | GroupDirectMessageChannel;

/**
 * ### [Channel](https://discord.com/developers/docs/resources/channel#channel-object)
 *
 * Represents a guild or DM channel within Discord.
 */
export const channelSchema = schema<Channel>(
  v.intersect([
    _commonChannelSchema,
    variantSchema<Channel>(`type`, [
      _guildOrganizationChannelVariantSchema,
      _guildTextChannelVariantSchema,
      _guildVoiceChannelVariantSchema,
      _guildForumChannelVariantSchema,
      _threadChannelVariantSchema,
      _directMessageChannelVariantSchema,
      _groupDirectMessageChannelVariantSchema
    ])
  ])
);

type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

// Build via the underlying unannotated schemas so v.partial / v.required
// still type-check; the result is still cast to a flat GenericSchema.
export const partialChannelSchema = schema<PartialExcept<Channel, `type`>>(
  v.intersect([
    v.partial(_commonChannelSchema),
    variantSchema<PartialExcept<Channel, `type`>>(`type`, [
      v.required(v.partial(_guildOrganizationChannelVariantSchema), [`type`]),
      v.required(v.partial(_guildTextChannelVariantSchema), [`type`]),
      v.required(v.partial(_guildVoiceChannelVariantSchema), [`type`]),
      v.required(v.partial(_guildForumChannelVariantSchema), [`type`]),
      v.required(v.partial(_threadChannelVariantSchema), [`type`]),
      v.required(v.partial(_directMessageChannelVariantSchema), [`type`]),
      v.required(v.partial(_groupDirectMessageChannelVariantSchema), [`type`])
    ])
  ])
);
