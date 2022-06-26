import type { Member } from "../guild/types";

// https://discord.com/developers/docs/resources/voice#voice-state-object-voice-state-structure
/** Used to represent a user's voice connection status. */
export interface VoiceState {
  /** the guild id this voice state is for */
  guildId?: string;
  /** the channel id this user is connected to */
  channelId?: string;
  /** the user id this voice state is for */
  userId: string;
  /** guild member object	the guild member this voice state is for */
  member?: Member;
  /** the session id for this voice state */
  sessionId: string;
  /** whether this user is deafened by the server */
  deaf: boolean;
  /** whether this user is muted by the server */
  mute: boolean;
  /** whether this user is locally deafened */
  selfDeaf: boolean;
  /** whether this user is locally muted */
  selfMute: boolean;
  /** whether this user is streaming using "Go Live" */
  selfStream?: boolean;
  /** whether this user's camera is enabled */
  selfVideo: boolean;
  /** whether this user is muted by the current user */
  suppress: boolean;
  /** the time at which the user requested to speak */
  requestToSpeakTimestamp?: number;
}

// https://discord.com/developers/docs/resources/voice#voice-region-object-voice-region-structure
export interface VoiceRegion {
  /** unique ID for the region */
  id: string;
  /** name of the region */
  name: string;
  /** true for a single server that is closest to the current user's client */
  optimal: boolean;
  /** whether this is a deprecated voice region (avoid switching to these) */
  deprecated: boolean;
  /** whether this is a custom voice region (used for events/etc) */
  custom: boolean;
}
