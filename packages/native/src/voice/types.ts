/**
 * Public types for the voice/calls domain.
 *
 * The `Call` is surfaced as a LIVE wrapper class ({@link ../voice/call.js | Call}) — the §1.4 case: a call is long-lived, richly interactive (mute/deaf/volume/audio-mode), and has its own per-call events. Its read-only sub-objects (a participant's voice state, audio devices, the VAD config) follow the read-handle→snapshot convention.
 */

import type { ChannelId, GuildId, UserId } from "../snowflake.js";

/** A call's network connection state, the public form of `Discord_Call_Status`. */
export type CallStatus =
  | `disconnected`
  | `joining`
  | `connecting`
  | `signalingConnected`
  | `connected`
  | `reconnecting`
  | `disconnecting`;

/** Maps the ABI's numeric `Discord_Call_Status` to the public string form. */
export const CALL_STATUS_BY_CODE: Record<number, CallStatus> = {
  0: `disconnected`,
  1: `joining`,
  2: `connecting`,
  3: `signalingConnected`,
  4: `connected`,
  5: `reconnecting`,
  6: `disconnecting`
};

/** A call's network error, the public form of `Discord_Call_Error`. */
export type CallError =
  | `none`
  | `signalingConnectionFailed`
  | `signalingUnexpectedClose`
  | `voiceConnectionFailed`
  | `joinTimeout`
  | `forbidden`;

/** Maps the ABI's numeric `Discord_Call_Error` to the public string form. */
export const CALL_ERROR_BY_CODE: Record<number, CallError> = {
  0: `none`,
  1: `signalingConnectionFailed`,
  2: `signalingUnexpectedClose`,
  3: `voiceConnectionFailed`,
  4: `joinTimeout`,
  5: `forbidden`
};

/** How a user's mic is keyed on a call: voice auto-detect (VAD) or push-to-talk. */
export type AudioMode = `uninitialized` | `vad` | `pushToTalk`;

/** Maps the ABI's numeric `Discord_AudioModeType` to the public string form. */
export const AUDIO_MODE_BY_CODE: Record<number, AudioMode> = {
  0: `uninitialized`,
  1: `vad`,
  2: `pushToTalk`
};

/** The reverse map, for marshaling an audio mode back into the SDK. */
export const AUDIO_MODE_CODE: Record<AudioMode, number> = {
  uninitialized: 0,
  vad: 1,
  pushToTalk: 2
};

/** A snapshot of one call participant's self-mute/deaf state. */
export interface VoiceState {
  /** Whether the user has muted their own microphone. */
  selfMute: boolean;
  /** Whether the user has deafened themselves. */
  selfDeaf: boolean;
}

/** A snapshot of an available audio input or output device. */
export interface AudioDevice {
  /** The device's id (pass to `setInputDevice`/`setOutputDevice`). */
  id: string;
  /** The device's display name. */
  name: string;
  /** Whether this is the system default device. */
  isDefault: boolean;
}

/** A snapshot of a call's voice-activity-detection threshold configuration. */
export interface VADThreshold {
  /** Whether Discord auto-detects the appropriate threshold. */
  automatic: boolean;
  /** The manual threshold (dBFS, range -100..0, default -60) when not automatic. */
  threshold: number;
}

/**
 * A serializable, plain-object view of a {@link ../voice/call.js | Call} at one moment — the live wrapper's getters read into a flat object. Produced by `call.toJSON()` (so `JSON.stringify(call)` works too); the canonical shape for any transport that can't carry the live wrapper. Per-participant volume/local-mute and the live event streams are NOT in the snapshot (they're per-id queries / subscriptions on the live wrapper).
 */
export interface CallSnapshot {
  /** The lobby/channel id this call is in. */
  channelId: ChannelId;
  /** The guild id this call is associated with. */
  guildId: GuildId;
  /** The current connection status. */
  status: CallStatus;
  /** The participant user ids. */
  participants: UserId[];
  /** Whether the current user's mic is muted. */
  selfMute: boolean;
  /** Whether the current user is deafened. */
  selfDeaf: boolean;
  /** How the current user's mic is keyed (VAD vs push-to-talk). */
  audioMode: AudioMode;
  /** The current VAD threshold configuration. */
  vadThreshold: VADThreshold;
}
