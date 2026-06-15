/** The voice/calls domain's IPC contract. Mirrors `@discordkit/native/voice`. */
import type {
  AudioDevice,
  AudioMode,
  CallStatus,
  VADThreshold
} from "@discordkit/native/voice";

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
 * A serializable snapshot of a call — the IPC stand-in for the live `Call`
 * wrapper. Reads return this; mutate the call with the id-keyed `voice.*` ops.
 */
export interface CallSnapshot {
  channelId: bigint;
  guildId: bigint;
  status: CallStatus;
  participants: bigint[];
  selfMute: boolean;
  selfDeaf: boolean;
  audioMode: AudioMode;
  vadThreshold: VADThreshold;
}

/** The `window.discord.voice` namespace (calls + client-wide audio). */
export interface VoiceBridge {
  /** Start a call in a lobby; resolves with its snapshot (or `undefined`). */
  startCall: (channelId: bigint) => Promise<CallSnapshot | undefined>;
  /** Get a call snapshot by channel id, or `undefined`. */
  getCall: (channelId: bigint) => Promise<CallSnapshot | undefined>;
  /** Get snapshots of every active call. */
  getCalls: () => Promise<CallSnapshot[]>;
  endCall: (channelId: bigint) => Promise<void>;
  endCalls: () => Promise<void>;
  // id-keyed call controls (operate on the live Call in the main process)
  setSelfMute: (channelId: bigint, mute: boolean) => Promise<void>;
  setSelfDeaf: (channelId: bigint, deaf: boolean) => Promise<void>;
  setLocalMute: (
    channelId: bigint,
    userId: bigint,
    mute: boolean
  ) => Promise<void>;
  setParticipantVolume: (
    channelId: bigint,
    userId: bigint,
    volume: number
  ) => Promise<void>;
  setAudioMode: (channelId: bigint, mode: AudioMode) => Promise<void>;
  setPushToTalkActive: (channelId: bigint, active: boolean) => Promise<void>;
  setVADThreshold: (
    channelId: bigint,
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
  ) => () => void;
}
