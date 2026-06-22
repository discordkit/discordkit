/**
 * Voice / calls — the public surface of `@discordkit/native/voice`.
 *
 * Start, get, and end voice calls in lobbies ({@link startCall}, {@link getCall},
 * {@link getCalls}, {@link endCall}, {@link endCalls}). A {@link Call} is a live
 * wrapper: status, participants, self/local mute + deaf, per-participant volume,
 * audio mode (VAD / push-to-talk), VAD threshold, and four per-call event streams
 * (`onStatusChanged`, `onParticipantChanged`, `onSpeakingStatusChanged`,
 * `onVoiceStateChanged`).
 *
 * Client-wide audio controls apply across all calls: input/output volume,
 * mute/deaf-all, audio device enumeration + selection
 * ({@link getInputDevices}, {@link setInputDevice}, …), and the device-change
 * event ({@link onDeviceChange}).
 */
export {
  startCall,
  getCall,
  getCalls,
  endCall,
  endCalls,
  getInputVolume,
  setInputVolume,
  getOutputVolume,
  setOutputVolume,
  isSelfMuted,
  setSelfMuteAll,
  isSelfDeafened,
  setSelfDeafAll,
  getInputDevices,
  getOutputDevices,
  getCurrentInputDevice,
  getCurrentOutputDevice,
  setInputDevice,
  setOutputDevice,
  onDeviceChange
} from "./calls.js";
export type { VoiceOptions } from "./calls.js";
export { Call } from "./call.js";
export {
  readVoiceState,
  readAudioDevice,
  readVADThreshold
} from "./voiceStateHandle.js";

export type {
  VoiceState,
  AudioDevice,
  VADThreshold,
  CallStatus,
  CallError,
  AudioMode,
  CallSnapshot
} from "./types.js";
