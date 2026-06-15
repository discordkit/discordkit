import { VOICE_CHANNELS, type VoiceBridge } from "../channels/voice.js";
import type { BridgeIo } from "../internal.js";

/** The voice preload slice — adds `window.discord.voice` (calls + audio). */
export const voiceSlice = (io: BridgeIo): { voice: VoiceBridge } => ({
  voice: {
    startCall: async (channelId) =>
      io.call(VOICE_CHANNELS.callStart, channelId),
    getCall: async (channelId) => io.call(VOICE_CHANNELS.callGet, channelId),
    getCalls: async () => io.call(VOICE_CHANNELS.callGetAll),
    endCall: async (channelId) => io.call(VOICE_CHANNELS.callEnd, channelId),
    endCalls: async () => io.call(VOICE_CHANNELS.callEndAll),
    setSelfMute: async (channelId, mute) =>
      io.call(VOICE_CHANNELS.callSetSelfMute, channelId, mute),
    setSelfDeaf: async (channelId, deaf) =>
      io.call(VOICE_CHANNELS.callSetSelfDeaf, channelId, deaf),
    setLocalMute: async (channelId, userId, mute) =>
      io.call(VOICE_CHANNELS.callSetLocalMute, channelId, userId, mute),
    setParticipantVolume: async (channelId, userId, volume) =>
      io.call(
        VOICE_CHANNELS.callSetParticipantVolume,
        channelId,
        userId,
        volume
      ),
    setAudioMode: async (channelId, mode) =>
      io.call(VOICE_CHANNELS.callSetAudioMode, channelId, mode),
    setPushToTalkActive: async (channelId, active) =>
      io.call(VOICE_CHANNELS.callSetPushToTalkActive, channelId, active),
    setVADThreshold: async (channelId, automatic, threshold) =>
      io.call(
        VOICE_CHANNELS.callSetVADThreshold,
        channelId,
        automatic,
        threshold
      ),
    getInputVolume: async () => io.call(VOICE_CHANNELS.getInputVolume),
    setInputVolume: async (volume) =>
      io.call(VOICE_CHANNELS.setInputVolume, volume),
    getOutputVolume: async () => io.call(VOICE_CHANNELS.getOutputVolume),
    setOutputVolume: async (volume) =>
      io.call(VOICE_CHANNELS.setOutputVolume, volume),
    isSelfMuted: async () => io.call(VOICE_CHANNELS.isSelfMuted),
    setSelfMuteAll: async (mute) =>
      io.call(VOICE_CHANNELS.setSelfMuteAll, mute),
    isSelfDeafened: async () => io.call(VOICE_CHANNELS.isSelfDeafened),
    setSelfDeafAll: async (deaf) =>
      io.call(VOICE_CHANNELS.setSelfDeafAll, deaf),
    getInputDevices: async () => io.call(VOICE_CHANNELS.getInputDevices),
    getOutputDevices: async () => io.call(VOICE_CHANNELS.getOutputDevices),
    getCurrentInputDevice: async () =>
      io.call(VOICE_CHANNELS.getCurrentInputDevice),
    getCurrentOutputDevice: async () =>
      io.call(VOICE_CHANNELS.getCurrentOutputDevice),
    setInputDevice: async (deviceId) =>
      io.call(VOICE_CHANNELS.setInputDevice, deviceId),
    setOutputDevice: async (deviceId) =>
      io.call(VOICE_CHANNELS.setOutputDevice, deviceId),
    onDeviceChange: (handler) => io.on(VOICE_CHANNELS.deviceChange, handler)
  }
});
