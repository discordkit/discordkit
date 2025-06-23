import {
  object,
  nullish,
  string,
  minLength,
  number,
  boolean,
  minValue,
  integer,
  optional,
  array,
  maxLength,
  maxValue,
  type InferOutput,
  isoTimestamp,
  pipe
} from "valibot";
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
export const channelSchema = object({
  /** the id of this channel */
  id: snowflake,
  /** the type of channel */
  type: channelTypeSchema,
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: nullish(snowflake),
  /** sorting position of the channel */
  position: nullish(pipe(number(), minValue(0))),
  /** explicit permission overwrites for members and roles */
  permissionOverwrites: nullish(array(overwriteSchema)),
  /** the name of the channel (1-100 characters) */
  name: nullish(pipe(string(), minLength(1), maxLength(100))),
  /** the channel topic (0-1024 characters) */
  topic: nullish(pipe(string(), minLength(0), maxLength(1024))),
  /** whether the channel is nsfw */
  nsfw: nullish(boolean()),
  /** the id of the last message sent in this channel (may not point to an existing or valid message) */
  lastMessageId: nullish(pipe(string(), minLength(1))),
  /** the bitrate (in bits) of the voice channel */
  bitrate: nullish(pipe(number(), integer(), minValue(0))),
  /** the user limit of the voice channel */
  userLimit: nullish(pipe(number(), integer(), minValue(0))),
  /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages` or `manage_channel`, are unaffected */
  rateLimitPerUser: nullish(
    pipe(number(), integer(), minValue(0), maxValue(21600))
  ),
  /** the recipients of the DM */
  recipients: nullish(array(userSchema)),
  /** icon hash of the group DM */
  icon: nullish(pipe(string(), minLength(1))),
  /** id of the creator of the group DM or thread */
  ownerId: nullish(snowflake),
  /** application id of the group DM creator if it is bot-created */
  applicationId: nullish(snowflake),
  /** for group DM channels: whether the channel is managed by an application via the gdm.join OAuth2 scope */
  managed: nullish(boolean()),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: nullish(pipe(string(), minLength(1), maxLength(50))),
  /** when the last pinned message was pinned. This may be null in events such as `GUILD_CREATE` when a message is not pinned. */
  lastPinTimestamp: nullish(pipe(string(), isoTimestamp())),
  /** voice region id for the voice channel, automatic when set to null */
  rtcRegion: optional(pipe(string(), minLength(1))),
  /** the camera video quality mode of the voice channel, 1 when not present */
  videoQualityMode: nullish(videoQualityModeSchema, VideoQualityMode.AUTO),
  /** an approximate count of messages in a thread, stops counting at 50 */
  messageCount: nullish(pipe(number(), integer(), maxValue(50))),
  /** an approximate count of users in a thread, stops counting at 50 */
  memberCount: nullish(pipe(number(), integer(), maxValue(50))),
  /** thread-specific fields not needed by other channels */
  threadMetadata: nullish(threadMetadataSchema),
  /** thread member object for the current user, if they have joined the thread, only included on certain API endpoints */
  member: nullish(threadMemberSchema),
  /** default duration that the clients (not the API) will use for newly created threads, in minutes, to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
  defaultAutoArchiveDuration: nullish(autoArchiveDurationSchema),
  /** computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction */
  permissions: nullish(pipe(string(), minLength(1))),
  /** channel flags combined as a bitfield */
  flags: nullish(pipe(number(), integer())),
  /** number of messages ever sent in a thread, it's similar to messageCount on message creation, but will not decrement the number when a message is deleted */
  totalMessageSent: nullish(pipe(number(), integer(), minValue(0))),
  /** the set of tags that can be used in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  availableTags: nullish(array(forumTagSchema)),
  /** the IDs of the set of tags that have been applied to a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  appliedTags: nullish(array(snowflake)),
  /** the emoji to show in the add reaction button on a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
  defaultReactionEmoji: nullish(defaultReactionSchema),
  /** the initial rateLimitPerUser to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update */
  defaultThreadRateLimitPerUser: nullish(
    pipe(number(), integer(), minValue(0))
  ),
  /** the default sort order type used to order posts in `GUILD_FORUM` and `GUILD_MEDIA` channels. Defaults to null, which indicates a preferred sort order hasn't been set by a channel admin */
  defaultSortOrder: optional(nullish(sortOrderTypeSchema), null),
  /** the default forum layout view used to display posts in `GUILD_FORUM` channels. Defaults to 0, which indicates a layout view has not been set by a channel admin */
  defaultForumLayout: nullish(forumLayoutTypeSchema, ForumLayoutType.NOT_SET)
});

export type Channel = InferOutput<typeof channelSchema>;
