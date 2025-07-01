import {
  object,
  string,
  boolean,
  nullable,
  exactOptional,
  nonEmpty,
  isoTimestamp,
  pipe,
  type InferOutput
} from "valibot";
import { snowflake } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";

// https://discord.com/developers/docs/resources/voice#voice-state-object-voice-state-structure
/** Used to represent a user's voice connection status. */
export const voiceStateSchema = object({
  /** the guild id this voice state is for */
  guildId: exactOptional(snowflake),
  /** the channel id this user is connected to */
  channelId: nullable(snowflake),
  /** the user id this voice state is for */
  userId: snowflake,
  /** guild member object	the guild member this voice state is for */
  member: exactOptional(memberSchema),
  /** the session id for this voice state */
  sessionId: pipe(string(), nonEmpty()),
  /** whether this user is deafened by the server */
  deaf: boolean(),
  /** whether this user is muted by the server */
  mute: boolean(),
  /** whether this user is locally deafened */
  selfDeaf: boolean(),
  /** whether this user is locally muted */
  selfMute: boolean(),
  /** whether this user is streaming using "Go Live" */
  selfStream: exactOptional(boolean()),
  /** whether this user's camera is enabled */
  selfVideo: boolean(),
  /** whether this user is muted by the current user */
  suppress: boolean(),
  /** the time at which the user requested to speak */
  requestToSpeakTimestamp: nullable(pipe(string(), isoTimestamp()))
});

export interface VoiceState extends InferOutput<typeof voiceStateSchema> {}
