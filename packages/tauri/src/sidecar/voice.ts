import {
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
  onDeviceChange,
  type AudioMode,
  type Call
} from "@discordkit/native/voice";
import type { UserId, ChannelId } from "@discordkit/native";
import { VOICE_CHANNELS, type CallSnapshot } from "../channels/voice.js";
import type { RegisterContext } from "../internal.js";

/** Snapshot a live `Call` wrapper into the serializable shape sent over the bridge. */
const snapshot = (call: Call): CallSnapshot => ({
  channelId: call.channelId,
  guildId: call.guildId,
  status: call.status,
  participants: call.participants,
  selfMute: call.selfMute,
  selfDeaf: call.selfDeaf,
  audioMode: call.audioMode,
  vadThreshold: call.vadThreshold
});

/**
 * Wire the voice domain: id-keyed call RPC (the live `Call` stays in the sidecar
 * and is re-resolved per action), client-wide audio controls, and the
 * device-change event broadcast. Imports ONLY `@discordkit/native/voice`.
 */
export const registerVoice = ({
  handle,
  broadcast,
  track
}: RegisterContext): void => {
  /** Re-resolve a live call by channel id or throw (the call ended). */
  const requireCall = (channelId: ChannelId): Call => {
    const call = getCall(channelId);
    if (!call) {
      throw new Error(
        `No active call in channel ${channelId} — it may have ended. ` +
          `Re-check with voice.getCalls().`
      );
    }
    return call;
  };

  // --- calls ---
  handle(VOICE_CHANNELS.callStart, (channelId: ChannelId) => {
    const call = startCall(channelId);
    return call ? snapshot(call) : undefined;
  });
  handle(VOICE_CHANNELS.callGet, (channelId: ChannelId) => {
    const call = getCall(channelId);
    return call ? snapshot(call) : undefined;
  });
  handle(VOICE_CHANNELS.callGetAll, () => getCalls().map(snapshot));
  handle(VOICE_CHANNELS.callEnd, async (channelId: ChannelId) =>
    endCall(channelId)
  );
  handle(VOICE_CHANNELS.callEndAll, async () => endCalls());
  handle(
    VOICE_CHANNELS.callSetSelfMute,
    (channelId: ChannelId, mute: boolean) => {
      requireCall(channelId).setSelfMute(mute);
    }
  );
  handle(
    VOICE_CHANNELS.callSetSelfDeaf,
    (channelId: ChannelId, deaf: boolean) => {
      requireCall(channelId).setSelfDeaf(deaf);
    }
  );
  handle(
    VOICE_CHANNELS.callSetLocalMute,
    (channelId: ChannelId, userId: UserId, mute: boolean) => {
      requireCall(channelId).setLocalMute(userId, mute);
    }
  );
  handle(
    VOICE_CHANNELS.callSetParticipantVolume,
    (channelId: ChannelId, userId: UserId, volume: number) => {
      requireCall(channelId).setParticipantVolume(userId, volume);
    }
  );
  handle(
    VOICE_CHANNELS.callSetAudioMode,
    (channelId: ChannelId, mode: AudioMode) => {
      requireCall(channelId).setAudioMode(mode);
    }
  );
  handle(
    VOICE_CHANNELS.callSetPushToTalkActive,
    (channelId: ChannelId, active: boolean) => {
      requireCall(channelId).setPushToTalkActive(active);
    }
  );
  handle(
    VOICE_CHANNELS.callSetVADThreshold,
    (channelId: ChannelId, automatic: boolean, threshold?: number) => {
      requireCall(channelId).setVADThreshold(automatic, threshold);
    }
  );

  // --- client-wide audio ---
  handle(VOICE_CHANNELS.getInputVolume, () => getInputVolume());
  handle(VOICE_CHANNELS.setInputVolume, (volume: number) =>
    setInputVolume(volume)
  );
  handle(VOICE_CHANNELS.getOutputVolume, () => getOutputVolume());
  handle(VOICE_CHANNELS.setOutputVolume, (volume: number) =>
    setOutputVolume(volume)
  );
  handle(VOICE_CHANNELS.isSelfMuted, () => isSelfMuted());
  handle(VOICE_CHANNELS.setSelfMuteAll, (mute: boolean) =>
    setSelfMuteAll(mute)
  );
  handle(VOICE_CHANNELS.isSelfDeafened, () => isSelfDeafened());
  handle(VOICE_CHANNELS.setSelfDeafAll, (deaf: boolean) =>
    setSelfDeafAll(deaf)
  );
  handle(VOICE_CHANNELS.getInputDevices, async () => getInputDevices());
  handle(VOICE_CHANNELS.getOutputDevices, async () => getOutputDevices());
  handle(VOICE_CHANNELS.getCurrentInputDevice, async () =>
    getCurrentInputDevice()
  );
  handle(VOICE_CHANNELS.getCurrentOutputDevice, async () =>
    getCurrentOutputDevice()
  );
  handle(VOICE_CHANNELS.setInputDevice, async (deviceId: string) =>
    setInputDevice(deviceId)
  );
  handle(VOICE_CHANNELS.setOutputDevice, async (deviceId: string) =>
    setOutputDevice(deviceId)
  );

  track(
    onDeviceChange((devices) => broadcast(VOICE_CHANNELS.deviceChange, devices))
  );
};
