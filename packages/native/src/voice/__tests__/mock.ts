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
  Discord_Call_GetLocalMute: (ctx) => false,
  Discord_Call_GetParticipantVolume: (ctx) => 100,
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
  Discord_Call_SetLocalMute: () => undefined,
  Discord_Call_SetParticipantVolume: () => undefined,
  Discord_Call_SetPTTActive: () => undefined,
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
