import { useClient } from "../ambient.js";
import { toSubscription } from "../client.js";
import type { DiscordClient, Subscription } from "../client.js";
import { awaitCallback, awaitResult, defineBindings } from "../ffi/bindings.js";
import type { ChannelId } from "../snowflake.js";
import { Call } from "./call.js";
import { readAudioDevice } from "./voiceStateHandle.js";
import type { AudioDevice } from "./types.js";

/**
 * The voice domain's client-level operations: start/get/end calls (and the live
 * {@link Call} wrapper they produce), plus the client-wide audio controls that
 * apply across all calls — input/output volume, mute/deaf-all, device
 * enumeration + selection, and the device-change event.
 *
 * Op shapes are unusually mixed here:
 * - `startCall`/`getCall` are SYNCHRONOUS (`bool` + `Discord_Call*` out-param) —
 *   they return a `Call` immediately (watch `call.status` for `connected`).
 * - `endCall`/`endCalls` are async but their callbacks carry NO `ClientResult`
 *   (just userData), so they use {@link awaitCallback}, not `awaitResult`.
 * - device enumeration callbacks also carry no result (a span / a device) →
 *   `awaitCallback`; `setInputDevice`/`setOutputDevice` DO carry a result →
 *   `awaitResult`.
 * - volume + mute/deaf-all are synchronous direct calls.
 */
const bindings = defineBindings({
  startCall: /* C */ `bool Discord_Client_StartCall(void *self, uint64_t channelId, void *returnValue)`,
  getCall: /* C */ `bool Discord_Client_GetCall(void *self, uint64_t channelId, void *returnValue)`,
  getCalls: /* C */ `void Discord_Client_GetCalls(void *self, Discord_Span *returnValue)`,
  endCall: /* C */ `void Discord_Client_EndCall(void *self, uint64_t channelId, void *cb, void *cbFree, void *cbUserData)`,
  endCalls: /* C */ `void Discord_Client_EndCalls(void *self, void *cb, void *cbFree, void *cbUserData)`,
  getInputVolume: /* C */ `float Discord_Client_GetInputVolume(void *self)`,
  setInputVolume: /* C */ `void Discord_Client_SetInputVolume(void *self, float inputVolume)`,
  getOutputVolume: /* C */ `float Discord_Client_GetOutputVolume(void *self)`,
  setOutputVolume: /* C */ `void Discord_Client_SetOutputVolume(void *self, float outputVolume)`,
  getSelfMuteAll: /* C */ `bool Discord_Client_GetSelfMuteAll(void *self)`,
  setSelfMuteAll: /* C */ `void Discord_Client_SetSelfMuteAll(void *self, bool mute)`,
  getSelfDeafAll: /* C */ `bool Discord_Client_GetSelfDeafAll(void *self)`,
  setSelfDeafAll: /* C */ `void Discord_Client_SetSelfDeafAll(void *self, bool deaf)`,
  getInputDevices: /* C */ `void Discord_Client_GetInputDevices(void *self, void *cb, void *cbFree, void *cbUserData)`,
  getOutputDevices: /* C */ `void Discord_Client_GetOutputDevices(void *self, void *cb, void *cbFree, void *cbUserData)`,
  getCurrentInputDevice: /* C */ `void Discord_Client_GetCurrentInputDevice(void *self, void *cb, void *cbFree, void *cbUserData)`,
  getCurrentOutputDevice: /* C */ `void Discord_Client_GetCurrentOutputDevice(void *self, void *cb, void *cbFree, void *cbUserData)`,
  setInputDevice: /* C */ `void Discord_Client_SetInputDevice(void *self, Discord_String deviceId, void *cb, void *cbFree, void *cbUserData)`,
  setOutputDevice: /* C */ `void Discord_Client_SetOutputDevice(void *self, Discord_String deviceId, void *cb, void *cbFree, void *cbUserData)`,
  setDeviceChangeCb: /* C */ `void Discord_Client_SetDeviceChangeCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  // no-result callbacks (data only)
  endCb: {
    callback: /* C */ `void EndCallCallback(void *userData)`
  },
  devicesCb: {
    callback: /* C */ `void GetDevicesCallback(Discord_AudioDeviceSpan devices, void *userData)`
  },
  currentDeviceCb: {
    callback: /* C */ `void GetCurrentDeviceCallback(void *device, void *userData)`
  },
  deviceChangeCb: {
    callback: /* C */ `void DeviceChangeCallback(Discord_AudioDeviceSpan inputDevices, Discord_AudioDeviceSpan outputDevices, void *userData)`
  },
  // result-bearing callbacks
  setDeviceCb: {
    callback: /* C */ `void SetDeviceCallback(void *result, void *userData)`
  }
});

/** Per-call options shared by voice operations. */
export interface VoiceOptions {
  /** Target a specific client instead of the ambient singleton. */
  client?: DiscordClient;
  /** Reject if the SDK hasn't acked within this many ms. Default 10000. */
  timeoutMs?: number;
}

/**
 * Start (or join) a voice call in a lobby, returning the live {@link Call} synchronously. The call isn't usable until `call.status` reaches `connected` — subscribe with `call.onStatusChanged`. Returns `undefined` if the SDK couldn't start the call.
 */
export const startCall = (
  channelId: ChannelId,
  options: { client?: DiscordClient } = {}
): Call | undefined => {
  const client = options.client ?? useClient();
  const out = client.lib.allocHandle();
  return bindings(client.lib).startCall(client.handle, BigInt(channelId), out)
    ? new Call(client, out)
    : undefined;
};

/** Get the active call in a lobby as a live {@link Call}, or `undefined`. Synchronous. */
export const getCall = (
  channelId: ChannelId,
  options: { client?: DiscordClient } = {}
): Call | undefined => {
  const client = options.client ?? useClient();
  const out = client.lib.allocHandle();
  return bindings(client.lib).getCall(client.handle, BigInt(channelId), out)
    ? new Call(client, out)
    : undefined;
};

/** Get all active calls as live {@link Call} wrappers. Synchronous. */
export const getCalls = (options: { client?: DiscordClient } = {}): Call[] => {
  const client = options.client ?? useClient();
  const span = client.lib.allocSpanOut();
  bindings(client.lib).getCalls(client.handle, span);
  return client.lib.readSpan(span).map((h) => new Call(client, h));
};

/** End the call in a lobby. Resolves when the SDK acks (no result to fail on). */
export const endCall = async (
  channelId: ChannelId,
  options: VoiceOptions = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  await awaitCallback(
    client,
    b.endCb,
    (ptr) => b.endCall(client.handle, BigInt(channelId), ptr, null, null),
    () => undefined,
    { timeoutMs: options.timeoutMs, label: `end call` }
  );
};

/** End all active calls. Resolves when the SDK acks. */
export const endCalls = async (options: VoiceOptions = {}): Promise<void> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  await awaitCallback(
    client,
    b.endCb,
    (ptr) => b.endCalls(client.handle, ptr, null, null),
    () => undefined,
    { timeoutMs: options.timeoutMs, label: `end calls` }
  );
};

/** The current global input (microphone) volume (0..100). Synchronous. */
export const getInputVolume = (
  options: { client?: DiscordClient } = {}
): number => {
  const client = options.client ?? useClient();
  return Number(bindings(client.lib).getInputVolume(client.handle));
};

/** Set the global input (microphone) volume (0..100). */
export const setInputVolume = (
  volume: number,
  options: { client?: DiscordClient } = {}
): void => {
  const client = options.client ?? useClient();
  bindings(client.lib).setInputVolume(client.handle, volume);
};

/** The current global output (speaker) volume (0..200, 100 = default). Synchronous. */
export const getOutputVolume = (
  options: { client?: DiscordClient } = {}
): number => {
  const client = options.client ?? useClient();
  return Number(bindings(client.lib).getOutputVolume(client.handle));
};

/** Set the global output (speaker) volume (0..200, 100 = default). */
export const setOutputVolume = (
  volume: number,
  options: { client?: DiscordClient } = {}
): void => {
  const client = options.client ?? useClient();
  bindings(client.lib).setOutputVolume(client.handle, volume);
};

/** Whether the current user is muted across all calls. Synchronous. */
export const isSelfMuted = (
  options: { client?: DiscordClient } = {}
): boolean => {
  const client = options.client ?? useClient();
  return Boolean(bindings(client.lib).getSelfMuteAll(client.handle));
};

/** Mute/unmute the current user's mic across all active and future calls. */
export const setSelfMuteAll = (
  mute: boolean,
  options: { client?: DiscordClient } = {}
): void => {
  const client = options.client ?? useClient();
  bindings(client.lib).setSelfMuteAll(client.handle, mute);
};

/** Whether the current user is deafened across all calls. Synchronous. */
export const isSelfDeafened = (
  options: { client?: DiscordClient } = {}
): boolean => {
  const client = options.client ?? useClient();
  return Boolean(bindings(client.lib).getSelfDeafAll(client.handle));
};

/** Deafen/undeafen the current user across all active and future calls. */
export const setSelfDeafAll = (
  deaf: boolean,
  options: { client?: DiscordClient } = {}
): void => {
  const client = options.client ?? useClient();
  bindings(client.lib).setSelfDeafAll(client.handle, deaf);
};

const readDevices = (client: DiscordClient, span: unknown): AudioDevice[] =>
  client.lib.readSpan(span).map((h) => readAudioDevice(client.lib, h));

/** List the available audio input (microphone) devices. */
export const getInputDevices = async (
  options: VoiceOptions = {}
): Promise<AudioDevice[]> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  return awaitCallback<AudioDevice[]>(
    client,
    b.devicesCb,
    (ptr) => b.getInputDevices(client.handle, ptr, null, null),
    (span) => readDevices(client, span),
    { timeoutMs: options.timeoutMs, label: `get input devices` }
  );
};

/** List the available audio output (speaker) devices. */
export const getOutputDevices = async (
  options: VoiceOptions = {}
): Promise<AudioDevice[]> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  return awaitCallback<AudioDevice[]>(
    client,
    b.devicesCb,
    (ptr) => b.getOutputDevices(client.handle, ptr, null, null),
    (span) => readDevices(client, span),
    { timeoutMs: options.timeoutMs, label: `get output devices` }
  );
};

/** Get the current input device, or `undefined` if none is selected. */
export const getCurrentInputDevice = async (
  options: VoiceOptions = {}
): Promise<AudioDevice | undefined> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  return awaitCallback<AudioDevice | undefined>(
    client,
    b.currentDeviceCb,
    (ptr) => b.getCurrentInputDevice(client.handle, ptr, null, null),
    (device) => (device ? readAudioDevice(client.lib, device) : undefined),
    { timeoutMs: options.timeoutMs, label: `get current input device` }
  );
};

/** Get the current output device, or `undefined` if none is selected. */
export const getCurrentOutputDevice = async (
  options: VoiceOptions = {}
): Promise<AudioDevice | undefined> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  return awaitCallback<AudioDevice | undefined>(
    client,
    b.currentDeviceCb,
    (ptr) => b.getCurrentOutputDevice(client.handle, ptr, null, null),
    (device) => (device ? readAudioDevice(client.lib, device) : undefined),
    { timeoutMs: options.timeoutMs, label: `get current output device` }
  );
};

/** Select the audio input device by id (from {@link getInputDevices}). */
export const setInputDevice = async (
  deviceId: string,
  options: VoiceOptions = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  await awaitResult(
    client,
    b.setDeviceCb,
    (ptr) =>
      b.setInputDevice(
        client.handle,
        client.lib.encodeString(deviceId),
        ptr,
        null,
        null
      ),
    () => undefined,
    { timeoutMs: options.timeoutMs, label: `set input device` }
  );
};

/** Select the audio output device by id (from {@link getOutputDevices}). */
export const setOutputDevice = async (
  deviceId: string,
  options: VoiceOptions = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  await awaitResult(
    client,
    b.setDeviceCb,
    (ptr) =>
      b.setOutputDevice(
        client.handle,
        client.lib.encodeString(deviceId),
        ptr,
        null,
        null
      ),
    () => undefined,
    { timeoutMs: options.timeoutMs, label: `set output device` }
  );
};

/**
 * Subscribe to the available audio devices changing (e.g. a headset plugged in). The handler receives the new input + output device lists. Returns an unsubscribe / `Disposable`. Single client-wide callback (re-subscribing replaces it), so call once.
 */
export const onDeviceChange = (
  handler: (devices: { input: AudioDevice[]; output: AudioDevice[] }) => void,
  options: { client?: DiscordClient } = {}
): Subscription => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  const cb = client.lib.registerCallback(
    b.deviceChangeCb,
    (input: unknown, output: unknown) => {
      handler({
        input: readDevices(client, input),
        output: readDevices(client, output)
      });
    }
  );
  client.trackCallback(cb);
  b.setDeviceChangeCb(client.handle, cb, null, null);
  return toSubscription(() => client.lib.unregisterCallback(cb));
};
