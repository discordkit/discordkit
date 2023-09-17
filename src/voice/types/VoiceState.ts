import { z } from "zod";
import { member } from "../../guild/types/Member";

// https://discord.com/developers/docs/resources/voice#voice-state-object-voice-state-structure
/** Used to represent a user's voice connection status. */

export const voiceState = z.object({
  /** the guild id this voice state is for */
  guildId: z.string().optional(),
  /** the channel id this user is connected to */
  channelId: z.string().optional(),
  /** the user id this voice state is for */
  userId: z.string(),
  /** guild member object	the guild member this voice state is for */
  member: member.optional(),
  /** the session id for this voice state */
  sessionId: z.string(),
  /** whether this user is deafened by the server */
  deaf: z.boolean(),
  /** whether this user is muted by the server */
  mute: z.boolean(),
  /** whether this user is locally deafened */
  selfDeaf: z.boolean(),
  /** whether this user is locally muted */
  selfMute: z.boolean(),
  /** whether this user is streaming using "Go Live" */
  selfStream: z.boolean().optional(),
  /** whether this user's camera is enabled */
  selfVideo: z.boolean(),
  /** whether this user is muted by the current user */
  suppress: z.boolean(),
  /** the time at which the user requested to speak */
  requestToSpeakTimestamp: z.number().optional()
});

export type VoiceState = z.infer<typeof voiceState>;
