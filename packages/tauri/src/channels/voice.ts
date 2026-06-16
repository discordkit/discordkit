/** The voice/calls domain's bridge contract. Mirrors `@discordkit/native/voice`. */
import type { UserId, ChannelId, GuildId } from "@discordkit/native";
import type {
  AudioDevice,
  AudioMode,
  CallStatus,
  VADThreshold
} from "@discordkit/native/voice";
import type { Unsubscribe } from "../internal.js";

export const VOICE_CHANNELS = {
  callStart: `discordkit:voice:start`,
  callGet: `discordkit:voice:get`,
  callGetAll: `discordkit:voice:getAll`,
  callEnd: `discordkit:voice:end`,
  callEndAll: `discordkit:voice:endAll`,
  callSetSelfMute: `discordkit:voice:setSelfMute`,
  callSetSelfDeaf: `discordkit:voice:setSelfDeaf`,
  callSetLocalMute: `discordkit:voice:setLocalMute`,
  callSetParticipantVolume: `discordkit:voice:setParticipantVolume`,
  callSetAudioMode: `discordkit:voice:setAudioMode`,
  callSetPushToTalkActive: `discordkit:voice:setPushToTalkActive`,
  callSetVADThreshold: `discordkit:voice:setVADThreshold`,
  getInputVolume: `discordkit:voice:getInputVolume`,
  setInputVolume: `discordkit:voice:setInputVolume`,
  getOutputVolume: `discordkit:voice:getOutputVolume`,
  setOutputVolume: `discordkit:voice:setOutputVolume`,
  isSelfMuted: `discordkit:voice:isSelfMuted`,
  setSelfMuteAll: `discordkit:voice:setSelfMuteAll`,
  isSelfDeafened: `discordkit:voice:isSelfDeafened`,
  setSelfDeafAll: `discordkit:voice:setSelfDeafAll`,
  getInputDevices: `discordkit:voice:getInputDevices`,
  getOutputDevices: `discordkit:voice:getOutputDevices`,
  getCurrentInputDevice: `discordkit:voice:getCurrentInputDevice`,
  getCurrentOutputDevice: `discordkit:voice:getCurrentOutputDevice`,
  setInputDevice: `discordkit:voice:setInputDevice`,
  setOutputDevice: `discordkit:voice:setOutputDevice`,
  deviceChange: `discordkit:voice:deviceChange`
} as const;

/**
 * A serializable snapshot of a call — the bridge stand-in for the live `Call`
 * wrapper. Reads return this; mutate the call with the id-keyed `voice.*` ops.
 */
export interface CallSnapshot {
  channelId: ChannelId;
  guildId: GuildId;
  status: CallStatus;
  participants: UserId[];
  selfMute: boolean;
  selfDeaf: boolean;
  audioMode: AudioMode;
  vadThreshold: VADThreshold;
}

/** The `voice` namespace on the webview bridge (calls + client-wide audio). */
export interface VoiceBridge {
  /** Start a call in a lobby; resolves with its snapshot (or `undefined`). */
  startCall: (channelId: ChannelId) => Promise<CallSnapshot | undefined>;
  /** Get a call snapshot by channel id, or `undefined`. */
  getCall: (channelId: ChannelId) => Promise<CallSnapshot | undefined>;
  /** Get snapshots of every active call. */
  getCalls: () => Promise<CallSnapshot[]>;
  endCall: (channelId: ChannelId) => Promise<void>;
  endCalls: () => Promise<void>;
  // id-keyed call controls (operate on the live Call in the sidecar)
  setSelfMute: (channelId: ChannelId, mute: boolean) => Promise<void>;
  setSelfDeaf: (channelId: ChannelId, deaf: boolean) => Promise<void>;
  setLocalMute: (
    channelId: ChannelId,
    userId: UserId,
    mute: boolean
  ) => Promise<void>;
  setParticipantVolume: (
    channelId: ChannelId,
    userId: UserId,
    volume: number
  ) => Promise<void>;
  setAudioMode: (channelId: ChannelId, mode: AudioMode) => Promise<void>;
  setPushToTalkActive: (channelId: ChannelId, active: boolean) => Promise<void>;
  setVADThreshold: (
    channelId: ChannelId,
    automatic: boolean,
    threshold?: number
  ) => Promise<void>;
  // client-wide audio
  getInputVolume: () => Promise<number>;
  setInputVolume: (volume: number) => Promise<void>;
  getOutputVolume: () => Promise<number>;
  setOutputVolume: (volume: number) => Promise<void>;
  isSelfMuted: () => Promise<boolean>;
  setSelfMuteAll: (mute: boolean) => Promise<void>;
  isSelfDeafened: () => Promise<boolean>;
  setSelfDeafAll: (deaf: boolean) => Promise<void>;
  getInputDevices: () => Promise<AudioDevice[]>;
  getOutputDevices: () => Promise<AudioDevice[]>;
  getCurrentInputDevice: () => Promise<AudioDevice | undefined>;
  getCurrentOutputDevice: () => Promise<AudioDevice | undefined>;
  setInputDevice: (deviceId: string) => Promise<void>;
  setOutputDevice: (deviceId: string) => Promise<void>;
  onDeviceChange: (
    handler: (devices: { input: AudioDevice[]; output: AudioDevice[] }) => void
  ) => Unsubscribe;
}
