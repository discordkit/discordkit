import * as v from "valibot";
import { snowflake, timestamp, boundedString, schema } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";

// https://discord.com/developers/docs/resources/voice#voice-state-object-voice-state-structure
const _voiceStateSchema = v.object({
  /** the guild id this voice state is for */
  guildId: v.exactOptional(snowflake),
  /** the channel id this user is connected to */
  channelId: v.nullable(snowflake),
  /** the user id this voice state is for */
  userId: snowflake,
  /** {@link Member | guild member object}	the {@link Member | guild member} this voice state is for */
  member: v.exactOptional(memberSchema),
  /** the session id for this voice state */
  sessionId: boundedString(),
  /** whether this user is deafened by the server */
  deaf: v.boolean(),
  /** whether this user is muted by the server */
  mute: v.boolean(),
  /** whether this user is locally deafened */
  selfDeaf: v.boolean(),
  /** whether this user is locally muted */
  selfMute: v.boolean(),
  /** whether this user is streaming using "Go Live" */
  selfStream: v.exactOptional(v.boolean()),
  /** whether this user's camera is enabled */
  selfVideo: v.boolean(),
  /** whether this user's permission to speak is denied */
  suppress: v.boolean(),
  /** the time at which the user requested to speak */
  requestToSpeakTimestamp: v.nullable(timestamp)
});

export interface VoiceState extends v.InferOutput<typeof _voiceStateSchema> {}

/**
 * ### [Voice State](https://discord.com/developers/docs/resources/voice#voice-state-object)
 *
 * Used to represent a user's voice connection status.
 */
export const voiceStateSchema = schema<VoiceState>(_voiceStateSchema);
