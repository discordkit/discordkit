// https://discord.com/developers/docs/events/gateway-events#channel-pins-update

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { timestamp } from "@discordkit/core/validations/timestamp";
import { channelSchema } from "@discordkit/client/channel/types/Channel";
import { threadMemberSchema } from "@discordkit/client/channel/types/ThreadMember";

const _channelPinsUpdateSchema = v.object({
  /** ID of the guild */
  guildId: v.optional(snowflake),
  /** ID of the channel */
  channelId: snowflake,
  /** Time at which the most recent pinned message was pinned */
  lastPinTimestamp: v.optional(v.nullable(timestamp))
});

export interface ChannelPinsUpdate extends v.InferOutput<
  typeof _channelPinsUpdateSchema
> {}

/**
 * ### [Channel Pins Update](https://discord.com/developers/docs/events/gateway-events#channel-pins-update)
 *
 * Fires when a message is pinned **or unpinned** — not when a pinned message is
 * deleted. `lastPinTimestamp` is null when the last pin was removed.
 */
export const channelPinsUpdateSchema = schema<ChannelPinsUpdate>(
  _channelPinsUpdateSchema
);

const _threadListSyncSchema = v.object({
  /** ID of the guild */
  guildId: snowflake,
  /** Parent channel ids whose threads are being synced; absent means the whole guild */
  channelIds: v.optional(v.array(snowflake)),
  /** All active threads in the given channels the current user can access */
  threads: v.array(channelSchema),
  /** Thread member objects for the current user, for each joined thread */
  members: v.array(threadMemberSchema)
});

export interface ThreadListSync extends v.InferOutput<
  typeof _threadListSyncSchema
> {}

/**
 * ### [Thread List Sync](https://discord.com/developers/docs/events/gateway-events#thread-list-sync)
 *
 * Sent when the current user gains access to a channel. An absent `channelIds`
 * means the sync covers the entire guild, not zero channels.
 */
export const threadListSyncSchema = schema<ThreadListSync>(
  _threadListSyncSchema
);

const _threadMembersUpdateSchema = v.object({
  /** ID of the thread */
  id: snowflake,
  /** ID of the guild */
  guildId: snowflake,
  /** Approximate number of members in the thread, capped at 50 */
  memberCount: v.number(),
  /** Users who were added to the thread */
  addedMembers: v.optional(v.array(threadMemberSchema)),
  /** Ids of the users who were removed from the thread */
  removedMemberIds: v.optional(v.array(snowflake))
});

export interface ThreadMembersUpdate extends v.InferOutput<
  typeof _threadMembersUpdateSchema
> {}

/**
 * ### [Thread Members Update](https://discord.com/developers/docs/events/gateway-events#thread-members-update)
 *
 * `memberCount` is capped at 50 by Discord — it is not a reliable total for
 * large threads.
 *
 * > [!NOTE]
 * >
 * > Gated by `GUILDS`, but `addedMembers` additionally requires the privileged
 * > `GUILD_MEMBERS` intent (the docs mark it with an asterisk). Without it the
 * > event still fires, minus that field.
 */
export const threadMembersUpdateSchema = schema<ThreadMembersUpdate>(
  _threadMembersUpdateSchema
);

const _channelInfoEntrySchema = v.object({
  /** ID of the channel */
  id: snowflake,
  /** The channel's voice status */
  status: v.optional(v.nullable(v.string())),
  /** When the current voice session started, as a Unix timestamp */
  voiceStartTime: v.optional(v.nullable(v.number()))
});

const _channelInfoSchema = v.object({
  /** ID of the guild */
  guildId: snowflake,
  /** Ephemeral data for the requested channels */
  channels: v.array(_channelInfoEntrySchema)
});

export interface ChannelInfo extends v.InferOutput<typeof _channelInfoSchema> {}

/**
 * ### [Channel Info](https://discord.com/developers/docs/events/gateway-events#channel-info)
 *
 * Ephemeral channel data, sent in response to a Request Channel Info
 * send-event. Never gated by an intent, since it answers your own request.
 */
export const channelInfoSchema = schema<ChannelInfo>(_channelInfoSchema);

const _voiceChannelStatusUpdateSchema = v.object({
  /** ID of the channel */
  id: snowflake,
  /** ID of the guild */
  guildId: snowflake,
  /** The new voice channel status */
  status: v.nullable(v.string())
});

export interface VoiceChannelStatusUpdate extends v.InferOutput<
  typeof _voiceChannelStatusUpdateSchema
> {}

/**
 * ### [Voice Channel Status Update](https://discord.com/developers/docs/events/gateway-events#voice-channel-status-update)
 */
export const voiceChannelStatusUpdateSchema = schema<VoiceChannelStatusUpdate>(
  _voiceChannelStatusUpdateSchema
);

const _voiceChannelStartTimeUpdateSchema = v.object({
  /** ID of the channel */
  id: snowflake,
  /** ID of the guild */
  guildId: snowflake,
  /** When the current voice session started, as a Unix timestamp */
  voiceStartTime: v.optional(v.nullable(v.number()))
});

export interface VoiceChannelStartTimeUpdate extends v.InferOutput<
  typeof _voiceChannelStartTimeUpdateSchema
> {}

/**
 * ### [Voice Channel Start Time Update](https://discord.com/developers/docs/events/gateway-events#voice-channel-start-time-update)
 */
export const voiceChannelStartTimeUpdateSchema =
  schema<VoiceChannelStartTimeUpdate>(_voiceChannelStartTimeUpdateSchema);
