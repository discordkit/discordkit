import { z } from "zod";
import { memberSchema } from "../../guild/types/Member";

// https://discord.com/developers/docs/resources/voice#voice-state-object-voice-state-structure
/** Used to represent a user's voice connection status. */

export const voiceStateSchema = z.object({
  /** the guild id this voice state is for */
  guildId: z.string().min(1).nullable(),
  /** the channel id this user is connected to */
  channelId: z.string().min(1).optional(),
  /** the user id this voice state is for */
  userId: z.string().min(1),
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
  requestToSpeakTimestamp: z.string().optional()
});

export type VoiceState = z.infer<typeof voiceStateSchema>;
