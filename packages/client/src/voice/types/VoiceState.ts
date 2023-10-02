import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.ts";

// https://discord.com/developers/docs/resources/voice#voice-state-object-voice-state-structure
/** Used to represent a user's voice connection status. */

export const voiceStateSchema = z.object({
  /** the guild id this voice state is for */
  guildId: snowflake.nullable(),
  /** the channel id this user is connected to */
  channelId: snowflake.optional(),
  /** the user id this voice state is for */
  userId: snowflake,
  /** guild member object	the guild member this voice state is for */
  member: memberSchema.nullable(),
  /** the session id for this voice state */
  sessionId: z.string().min(1),
  /** whether this user is deafened by the server */
  deaf: z.boolean(),
  /** whether this user is muted by the server */
  mute: z.boolean(),
  /** whether this user is locally deafened */
  selfDeaf: z.boolean(),
  /** whether this user is locally muted */
  selfMute: z.boolean(),
  /** whether this user is streaming using "Go Live" */
  selfStream: z.boolean().nullable(),
  /** whether this user's camera is enabled */
  selfVideo: z.boolean(),
  /** whether this user is muted by the current user */
  suppress: z.boolean(),
  /** the time at which the user requested to speak */
  requestToSpeakTimestamp: z.string().datetime().optional()
});

export type VoiceState = z.infer<typeof voiceStateSchema>;
