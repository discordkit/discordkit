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
  type Call,
  type CallSnapshot
} from "@discordkit/native/voice";
import type { UserId, ChannelId } from "@discordkit/native";
import { VOICE_CHANNELS } from "../channels/voice.js";
import type { RegisterContext } from "../internal.js";

/** Serialize a live `Call` into the IPC shape (native owns the snapshot). */
const snapshot = (call: Call): CallSnapshot => call.toJSON();

/**
 * Wire the voice domain: id-keyed call RPC (the live `Call` stays here and is
 * re-resolved per action), client-wide audio controls, and the device-change
 * event broadcast. Imports ONLY `@discordkit/native/voice`.
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
  handle(VOICE_CHANNELS.callStart, (_e, channelId: ChannelId) => {
    const call = startCall(channelId);
    return call ? snapshot(call) : undefined;
  });
  handle(VOICE_CHANNELS.callGet, (_e, channelId: ChannelId) => {
    const call = getCall(channelId);
    return call ? snapshot(call) : undefined;
  });
  handle(VOICE_CHANNELS.callGetAll, () => getCalls().map(snapshot));
  handle(VOICE_CHANNELS.callEnd, async (_e, channelId: ChannelId) =>
    endCall(channelId)
  );
  handle(VOICE_CHANNELS.callEndAll, async () => endCalls());
  handle(
    VOICE_CHANNELS.callSetSelfMute,
    (_e, channelId: ChannelId, mute: boolean) => {
      requireCall(channelId).setSelfMute(mute);
    }
  );
  handle(
    VOICE_CHANNELS.callSetSelfDeaf,
    (_e, channelId: ChannelId, deaf: boolean) => {
      requireCall(channelId).setSelfDeaf(deaf);
    }
  );
  handle(
    VOICE_CHANNELS.callSetLocalMute,
    (_e, channelId: ChannelId, userId: UserId, mute: boolean) => {
      requireCall(channelId).setLocalMute(userId, mute);
    }
  );
  handle(
    VOICE_CHANNELS.callSetParticipantVolume,
    (_e, channelId: ChannelId, userId: UserId, volume: number) => {
      requireCall(channelId).setParticipantVolume(userId, volume);
    }
  );
  handle(
    VOICE_CHANNELS.callSetAudioMode,
    (_e, channelId: ChannelId, mode: AudioMode) => {
      requireCall(channelId).setAudioMode(mode);
    }
  );
  handle(
    VOICE_CHANNELS.callSetPushToTalkActive,
    (_e, channelId: ChannelId, active: boolean) => {
      requireCall(channelId).setPushToTalkActive(active);
    }
  );
  handle(
    VOICE_CHANNELS.callSetVADThreshold,
    (_e, channelId: ChannelId, automatic: boolean, threshold?: number) => {
      requireCall(channelId).setVADThreshold(automatic, threshold);
    }
  );

  // --- client-wide audio ---
  handle(VOICE_CHANNELS.getInputVolume, () => getInputVolume());
  handle(VOICE_CHANNELS.setInputVolume, (_e, volume: number) =>
    setInputVolume(volume)
  );
  handle(VOICE_CHANNELS.getOutputVolume, () => getOutputVolume());
  handle(VOICE_CHANNELS.setOutputVolume, (_e, volume: number) =>
    setOutputVolume(volume)
  );
  handle(VOICE_CHANNELS.isSelfMuted, () => isSelfMuted());
  handle(VOICE_CHANNELS.setSelfMuteAll, (_e, mute: boolean) =>
    setSelfMuteAll(mute)
  );
  handle(VOICE_CHANNELS.isSelfDeafened, () => isSelfDeafened());
  handle(VOICE_CHANNELS.setSelfDeafAll, (_e, deaf: boolean) =>
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
  handle(VOICE_CHANNELS.setInputDevice, async (_e, deviceId: string) =>
    setInputDevice(deviceId)
  );
  handle(VOICE_CHANNELS.setOutputDevice, async (_e, deviceId: string) =>
    setOutputDevice(deviceId)
  );

  track(
    onDeviceChange((devices) => broadcast(VOICE_CHANNELS.deviceChange, devices))
  );
};
