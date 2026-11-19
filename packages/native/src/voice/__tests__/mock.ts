import {
  registerMockHandlers,
  type MockContext,
  type MockState
} from "../../__tests__/mockBackend.js";

/**
 * Mock behavior for the voice domain. Covers the Call wrapper's getters/setters,
 * the start/get/end ops, client-wide audio (volume, mute/deaf-all, devices), and
 * the per-call + device-change events (delivered via {@link fireCallEvent} /
 * {@link fireDeviceChange}).
 *
 * A scripted call's handle stashes `__call`; a device `__device`; a voice state
 * `__voice`. Per-call event callbacks are captured per state (keyed by event).
 */

export interface ScriptedDevice {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface ScriptedVoiceState {
  selfMute: boolean;
  selfDeaf: boolean;
}

export interface ScriptedVoiceSettings {
  selfMute: boolean;
  selfDeaf: boolean;
  /** The ABI's numeric `Discord_VoiceInputModeType`. */
  inputMode: number;
  pttKey: string;
  inputVolume: number;
  outputVolume: number;
  automaticGainControl: boolean;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  noiseCancellation: boolean;
}

export interface ScriptedCall {
  channelId: bigint;
  guildId: bigint;
  status: number;
  participants: bigint[];
  audioMode: number;
  selfMute: boolean;
  selfDeaf: boolean;
  vad: { automatic: boolean; threshold: number };
  voiceStates: Record<string, ScriptedVoiceState>;
  /** Per-user local-mute state, set by `SetLocalMute`, read by `GetLocalMute`. */
  localMutes: Record<string, boolean>;
  /** Per-user playout volume, set by `SetParticipantVolume`, read by its getter. */
  volumes: Record<string, number>;
  /** Whether push-to-talk is currently active (last `SetPTTActive`). */
  pttActive: boolean;
}

interface VoiceDomainState {
  calls: Map<bigint, ScriptedCall>;
  inputDevices: ScriptedDevice[];
  outputDevices: ScriptedDevice[];
  currentInput?: ScriptedDevice;
  currentOutput?: ScriptedDevice;
  inputVolume: number;
  outputVolume: number;
  selfMuteAll: boolean;
  selfDeafAll: boolean;
  actions: string[];
  callEvents: Partial<Record<string, unknown>>;
  deviceChange?: unknown;
  voiceSettings?: ScriptedVoiceSettings;
  voiceSettingsUpdated?: unknown;
  invoke?: (handle: unknown, ...args: unknown[]) => void;
}

const store = new WeakMap<MockState, VoiceDomainState>();
const stateOf = (s: MockState): VoiceDomainState => {
  let v = store.get(s);
  if (!v) {
    v = {
      calls: new Map(),
      inputDevices: [],
      outputDevices: [],
      inputVolume: 100,
      outputVolume: 100,
      selfMuteAll: false,
      selfDeafAll: false,
      actions: [],
      callEvents: {}
    };
    store.set(s, v);
  }
  return v;
};

/** Make a fully-populated scripted call, overridable per field. */
export const makeCall = (
  overrides: Partial<ScriptedCall> = {}
): ScriptedCall => ({
  channelId: 5000n,
  guildId: 800n,
  status: 4, // connected
  participants: [11n, 22n],
  audioMode: 1, // vad
  selfMute: false,
  selfDeaf: false,
  vad: { automatic: true, threshold: -60 },
  voiceStates: {},
  localMutes: {},
  volumes: {},
  pttActive: false,
  ...overrides
});

/** Register a scripted call so startCall/getCall return it. */
export const scriptCall = (state: MockState, call: ScriptedCall): void => {
  stateOf(state).calls.set(call.channelId, call);
};

/** Set the input + output devices enumeration returns. */
export const scriptDevices = (
  state: MockState,
  input: ScriptedDevice[],
  output: ScriptedDevice[]
): void => {
  const s = stateOf(state);
  s.inputDevices = input;
  s.outputDevices = output;
};

/** Set the current input/output devices `getCurrent*Device` resolves with. */
export const scriptCurrentDevices = (
  state: MockState,
  input: ScriptedDevice | undefined,
  output: ScriptedDevice | undefined
): void => {
  const s = stateOf(state);
  s.currentInput = input;
  s.currentOutput = output;
};

/** Names of the voice ops invoked on this mock, in order. */
export const voiceActionsOf = (state: MockState): string[] =>
  stateOf(state).actions;

/** Deliver a per-call event (callback captured from the Call's setter). */
export const fireCallEvent = (
  state: MockState,
  event:
    | `StatusChanged`
    | `ParticipantChanged`
    | `SpeakingStatusChanged`
    | `VoiceStateChanged`,
  ...args: unknown[]
): void => {
  const s = stateOf(state);
  s.invoke?.(s.callEvents[event], ...args);
};

/** Deliver a device-change event. */
export const fireDeviceChange = (
  state: MockState,
  input: ScriptedDevice[],
  output: ScriptedDevice[]
): void => {
  const s = stateOf(state);
  s.invoke?.(
    s.deviceChange,
    { __span: input.map((d) => ({ __device: d })) },
    { __span: output.map((d) => ({ __device: d })) }
  );
};

/** Make fully-populated scripted voice settings, overridable per field. */
export const makeVoiceSettings = (
  overrides: Partial<ScriptedVoiceSettings> = {}
): ScriptedVoiceSettings => ({
  selfMute: false,
  selfDeaf: false,
  inputMode: 0, // voice activity
  pttKey: ``,
  inputVolume: 100,
  outputVolume: 100,
  automaticGainControl: true,
  echoCancellation: true,
  noiseSuppression: true,
  noiseCancellation: false,
  ...overrides
});

/** Set the settings `getVoiceSettings` resolves with. */
export const scriptVoiceSettings = (
  state: MockState,
  settings: ScriptedVoiceSettings
): void => {
  stateOf(state).voiceSettings = settings;
};

/** Deliver a voice-settings-updated event. */
export const fireVoiceSettingsUpdated = (
  state: MockState,
  settings: ScriptedVoiceSettings
): void => {
  const s = stateOf(state);
  s.invoke?.(s.voiceSettingsUpdated, { __settings: settings });
};

const settingsOf = (handle: unknown): ScriptedVoiceSettings | undefined =>
  (handle as { __settings?: ScriptedVoiceSettings }).__settings;
const callOf = (handle: unknown): ScriptedCall | undefined =>
  (handle as { __call?: ScriptedCall }).__call;
const deviceOf = (handle: unknown): ScriptedDevice | undefined =>
  (handle as { __device?: ScriptedDevice }).__device;

const captureCallEvent =
  (event: string) =>
  (ctx: MockContext): undefined => {
    const s = stateOf(ctx.state);
    s.callEvents[event] = ctx.args[1];
    s.invoke = ctx.invokeCallback;
    return undefined;
  };

registerMockHandlers({
  // --- entry ops (sync) ---
  Discord_Client_StartCall: (ctx) => {
    stateOf(ctx.state).actions.push(ctx.name);
    const call = stateOf(ctx.state).calls.get(ctx.args[1] as bigint);
    if (!call) return false;
    (ctx.args[2] as { __call?: ScriptedCall }).__call = call;
    return true;
  },
  Discord_Client_GetCall: (ctx) => {
    const call = stateOf(ctx.state).calls.get(ctx.args[1] as bigint);
    if (!call) return false;
    (ctx.args[2] as { __call?: ScriptedCall }).__call = call;
    return true;
  },
  Discord_Client_GetCalls: (ctx) => {
    (ctx.args[1] as { __span?: unknown[] }).__span = [
      ...stateOf(ctx.state).calls.values()
    ].map((c) => ({ __call: c }));
    return undefined;
  },
  Discord_Client_EndCall: (ctx) => {
    stateOf(ctx.state).actions.push(ctx.name);
    // EndCallCallback carries NO result — fire the captured cb with no result arg.
    ctx.invokeCallback(ctx.args[2]);
    return undefined;
  },
  Discord_Client_EndCalls: (ctx) => {
    stateOf(ctx.state).actions.push(ctx.name);
    ctx.invokeCallback(ctx.args[1]);
    return undefined;
  },
  // --- client audio (sync) ---
  Discord_Client_GetInputVolume: (ctx) => stateOf(ctx.state).inputVolume,
  Discord_Client_SetInputVolume: (ctx) => {
    stateOf(ctx.state).inputVolume = ctx.args[1] as number;
    return undefined;
  },
  Discord_Client_GetOutputVolume: (ctx) => stateOf(ctx.state).outputVolume,
  Discord_Client_SetOutputVolume: (ctx) => {
    stateOf(ctx.state).outputVolume = ctx.args[1] as number;
    return undefined;
  },
  Discord_Client_GetSelfMuteAll: (ctx) => stateOf(ctx.state).selfMuteAll,
  Discord_Client_SetSelfMuteAll: (ctx) => {
    stateOf(ctx.state).selfMuteAll = Boolean(ctx.args[1]);
    return undefined;
  },
  Discord_Client_GetSelfDeafAll: (ctx) => stateOf(ctx.state).selfDeafAll,
  Discord_Client_SetSelfDeafAll: (ctx) => {
    stateOf(ctx.state).selfDeafAll = Boolean(ctx.args[1]);
    return undefined;
  },
  // --- devices (async, no result) ---
  Discord_Client_GetInputDevices: (ctx) => {
    ctx.invokeCallback(ctx.args[1], {
      __span: stateOf(ctx.state).inputDevices.map((d) => ({ __device: d }))
    });
    return undefined;
  },
  Discord_Client_GetOutputDevices: (ctx) => {
    ctx.invokeCallback(ctx.args[1], {
      __span: stateOf(ctx.state).outputDevices.map((d) => ({ __device: d }))
    });
    return undefined;
  },
  Discord_Client_GetCurrentInputDevice: (ctx) => {
    const d = stateOf(ctx.state).currentInput;
    ctx.invokeCallback(ctx.args[1], d ? { __device: d } : null);
    return undefined;
  },
  Discord_Client_GetCurrentOutputDevice: (ctx) => {
    const d = stateOf(ctx.state).currentOutput;
    ctx.invokeCallback(ctx.args[1], d ? { __device: d } : null);
    return undefined;
  },
  Discord_Client_SetInputDevice: (ctx) => {
    stateOf(ctx.state).actions.push(ctx.name);
    ctx.fireResultCallback();
    return undefined;
  },
  Discord_Client_SetOutputDevice: (ctx) => {
    stateOf(ctx.state).actions.push(ctx.name);
    ctx.fireResultCallback();
    return undefined;
  },
  Discord_Client_SetDeviceChangeCallback: (ctx) => {
    const s = stateOf(ctx.state);
    s.deviceChange = ctx.args[1];
    s.invoke = ctx.invokeCallback;
    return undefined;
  },
  // --- Discord client voice settings ---
  Discord_Client_GetVoiceSettings: (ctx) => {
    ctx.fireResultCallback({
      __settings: stateOf(ctx.state).voiceSettings ?? makeVoiceSettings()
    });
    return undefined;
  },
  Discord_Client_SetVoiceSettingsUpdatedCallback: (ctx) => {
    const s = stateOf(ctx.state);
    s.voiceSettingsUpdated = ctx.args[1];
    s.invoke = ctx.invokeCallback;
    return undefined;
  },
  Discord_VoiceSettings_SelfMute: (ctx) =>
    Boolean(settingsOf(ctx.args[0])?.selfMute),
  Discord_VoiceSettings_SelfDeaf: (ctx) =>
    Boolean(settingsOf(ctx.args[0])?.selfDeaf),
  Discord_VoiceSettings_InputMode: (ctx) =>
    settingsOf(ctx.args[0])?.inputMode ?? 0,
  Discord_VoiceSettings_PttKey: (ctx) => {
    ctx.writeString(ctx.args[1], settingsOf(ctx.args[0])?.pttKey ?? ``);
    return undefined;
  },
  Discord_VoiceSettings_InputVolume: (ctx) =>
    settingsOf(ctx.args[0])?.inputVolume ?? 0,
  Discord_VoiceSettings_OutputVolume: (ctx) =>
    settingsOf(ctx.args[0])?.outputVolume ?? 0,
  Discord_VoiceSettings_AutomaticGainControl: (ctx) =>
    Boolean(settingsOf(ctx.args[0])?.automaticGainControl),
  Discord_VoiceSettings_EchoCancellation: (ctx) =>
    Boolean(settingsOf(ctx.args[0])?.echoCancellation),
  Discord_VoiceSettings_NoiseSuppression: (ctx) =>
    Boolean(settingsOf(ctx.args[0])?.noiseSuppression),
  Discord_VoiceSettings_NoiseCancellation: (ctx) =>
    Boolean(settingsOf(ctx.args[0])?.noiseCancellation),
  // --- Call getters ---
  Discord_Call_GetChannelId: (ctx) => callOf(ctx.args[0])?.channelId ?? 0n,
  Discord_Call_GetGuildId: (ctx) => callOf(ctx.args[0])?.guildId ?? 0n,
  Discord_Call_GetStatus: (ctx) => callOf(ctx.args[0])?.status ?? 0,
  Discord_Call_GetAudioMode: (ctx) => callOf(ctx.args[0])?.audioMode ?? 0,
  Discord_Call_GetSelfMute: (ctx) => Boolean(callOf(ctx.args[0])?.selfMute),
  Discord_Call_GetSelfDeaf: (ctx) => Boolean(callOf(ctx.args[0])?.selfDeaf),
  Discord_Call_GetParticipants: (ctx) => {
    (ctx.args[1] as { __span?: bigint[] }).__span =
      callOf(ctx.args[0])?.participants ?? [];
    return undefined;
  },
  Discord_Call_GetLocalMute: (ctx) =>
    Boolean(callOf(ctx.args[0])?.localMutes[String(ctx.args[1])]),
  Discord_Call_GetParticipantVolume: (ctx) =>
    callOf(ctx.args[0])?.volumes[String(ctx.args[1])] ?? 100,
  Discord_Call_GetVoiceStateHandle: (ctx) => {
    const vs = callOf(ctx.args[0])?.voiceStates[String(ctx.args[1])];
    if (!vs) return false;
    (ctx.args[2] as { __voice?: ScriptedVoiceState }).__voice = vs;
    return true;
  },
  Discord_Call_GetVADThreshold: (ctx) => {
    (
      ctx.args[1] as { __vad?: { automatic: boolean; threshold: number } }
    ).__vad = callOf(ctx.args[0])?.vad ?? { automatic: true, threshold: -60 };
    return undefined;
  },
  // --- Call setters (record onto the scripted call) ---
  Discord_Call_SetSelfMute: (ctx) => {
    const c = callOf(ctx.args[0]);
    if (c) c.selfMute = Boolean(ctx.args[1]);
    return undefined;
  },
  Discord_Call_SetSelfDeaf: (ctx) => {
    const c = callOf(ctx.args[0]);
    if (c) c.selfDeaf = Boolean(ctx.args[1]);
    return undefined;
  },
  Discord_Call_SetAudioMode: (ctx) => {
    const c = callOf(ctx.args[0]);
    if (c) c.audioMode = ctx.args[1] as number;
    return undefined;
  },
  Discord_Call_SetLocalMute: (ctx) => {
    const c = callOf(ctx.args[0]);
    if (c) c.localMutes[String(ctx.args[1])] = Boolean(ctx.args[2]);
    return undefined;
  },
  Discord_Call_SetParticipantVolume: (ctx) => {
    const c = callOf(ctx.args[0]);
    if (c) c.volumes[String(ctx.args[1])] = ctx.args[2] as number;
    return undefined;
  },
  Discord_Call_SetPTTActive: (ctx) => {
    const c = callOf(ctx.args[0]);
    if (c) c.pttActive = Boolean(ctx.args[1]);
    return undefined;
  },
  Discord_Call_SetVADThreshold: (ctx) => {
    const c = callOf(ctx.args[0]);
    if (c)
      c.vad = {
        automatic: Boolean(ctx.args[1]),
        threshold: ctx.args[2] as number
      };
    return undefined;
  },
  // --- Call event setters ---
  Discord_Call_SetStatusChangedCallback: captureCallEvent(`StatusChanged`),
  Discord_Call_SetParticipantChangedCallback:
    captureCallEvent(`ParticipantChanged`),
  Discord_Call_SetSpeakingStatusChangedCallback: captureCallEvent(
    `SpeakingStatusChanged`
  ),
  Discord_Call_SetOnVoiceStateChangedCallback:
    captureCallEvent(`VoiceStateChanged`),
  // --- VoiceStateHandle getters ---
  Discord_VoiceStateHandle_SelfMute: (ctx) =>
    Boolean(
      (ctx.args[0] as { __voice?: ScriptedVoiceState }).__voice?.selfMute
    ),
  Discord_VoiceStateHandle_SelfDeaf: (ctx) =>
    Boolean(
      (ctx.args[0] as { __voice?: ScriptedVoiceState }).__voice?.selfDeaf
    ),
  // --- VADThresholdSettings getters ---
  Discord_VADThresholdSettings_Automatic: (ctx) =>
    Boolean(
      (ctx.args[0] as { __vad?: { automatic: boolean } }).__vad?.automatic
    ),
  Discord_VADThresholdSettings_VadThreshold: (ctx) =>
    (ctx.args[0] as { __vad?: { threshold: number } }).__vad?.threshold ?? -60,
  // --- AudioDevice getters ---
  Discord_AudioDevice_IsDefault: (ctx) =>
    Boolean(deviceOf(ctx.args[0])?.isDefault),
  Discord_AudioDevice_Id: (ctx) => {
    ctx.writeString(ctx.args[1], deviceOf(ctx.args[0])?.id ?? ``);
    return undefined;
  },
  Discord_AudioDevice_Name: (ctx) => {
    ctx.writeString(ctx.args[1], deviceOf(ctx.args[0])?.name ?? ``);
    return undefined;
  }
});
