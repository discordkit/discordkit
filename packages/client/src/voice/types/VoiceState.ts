import {
  object,
  nullish,
  optional,
  string,
  minLength,
  boolean,
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
  guildId: nullish(snowflake),
  /** the channel id this user is connected to */
  channelId: optional(snowflake),
  /** the user id this voice state is for */
  userId: snowflake,
  /** guild member object	the guild member this voice state is for */
  member: nullish(memberSchema),
  /** the session id for this voice state */
  sessionId: pipe(string(), minLength(1)),
  /** whether this user is deafened by the server */
  deaf: boolean(),
  /** whether this user is muted by the server */
  mute: boolean(),
  /** whether this user is locally deafened */
  selfDeaf: boolean(),
  /** whether this user is locally muted */
  selfMute: boolean(),
  /** whether this user is streaming using "Go Live" */
  selfStream: nullish(boolean()),
  /** whether this user's camera is enabled */
  selfVideo: boolean(),
  /** whether this user is muted by the current user */
  suppress: boolean(),
  /** the time at which the user requested to speak */
  requestToSpeakTimestamp: optional(pipe(string(), isoTimestamp()))
});

export type VoiceState = InferOutput<typeof voiceStateSchema>;
