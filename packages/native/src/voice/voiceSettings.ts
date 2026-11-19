import { useClient } from "../ambient.js";
import { toSubscription } from "../client.js";
import type { DiscordClient, Subscription } from "../client.js";
import { awaitResult, defineBindings } from "../ffi/bindings.js";
import { readString } from "../ffi/readers.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";
import type { VoiceOptions } from "./calls.js";
import { VOICE_INPUT_MODE_BY_CODE } from "./types.js";
import type { VoiceSettings } from "./types.js";

/**
 * Read-only access to the voice settings of the user's Discord desktop client: mute/deafen, volumes, voice mode, the push-to-talk key, and the audio-processing toggles. They belong to the Discord client, not to any call this SDK is in, so they can differ from the SDK's own client-wide audio controls (`getInputVolume`, `isSelfMuted`, …).
 *
 * Added in Social SDK 1.10.19337. These symbols are bound as their own set, apart from the call operations, because a binding set resolves all of its symbols on first use: an older SDK build that lacks them still loads everything else in the voice domain, and only these two operations fail there.
 */
const bindings = defineBindings({
  get: /* C */ `void Discord_Client_GetVoiceSettings(void *self, void *cb, void *cbFree, void *cbUserData)`,
  setUpdatedCb: /* C */ `void Discord_Client_SetVoiceSettingsUpdatedCallback(void *self, void *callback, void *callbackFree, void *callbackUserData)`,
  selfMute: /* C */ `bool Discord_VoiceSettings_SelfMute(void *self)`,
  selfDeaf: /* C */ `bool Discord_VoiceSettings_SelfDeaf(void *self)`,
  inputMode: /* C */ `int Discord_VoiceSettings_InputMode(void *self)`,
  pttKey: /* C */ `void Discord_VoiceSettings_PttKey(void *self, Discord_String *returnValue)`,
  inputVolume: /* C */ `float Discord_VoiceSettings_InputVolume(void *self)`,
  outputVolume: /* C */ `float Discord_VoiceSettings_OutputVolume(void *self)`,
  automaticGainControl: /* C */ `bool Discord_VoiceSettings_AutomaticGainControl(void *self)`,
  echoCancellation: /* C */ `bool Discord_VoiceSettings_EchoCancellation(void *self)`,
  noiseSuppression: /* C */ `bool Discord_VoiceSettings_NoiseSuppression(void *self)`,
  noiseCancellation: /* C */ `bool Discord_VoiceSettings_NoiseCancellation(void *self)`,
  getCb: {
    callback: /* C */ `void GetVoiceSettingsCallback(void *result, void *settings, void *userData)`
  },
  updatedCb: {
    callback: /* C */ `void VoiceSettingsUpdatedCallback(void *settings, void *userData)`
  }
});

/** Read a native `VoiceSettings` into a plain {@link VoiceSettings} snapshot. The handle is only valid for the duration of the callback that delivered it, so it is read in full, immediately. */
export const readVoiceSettings = (
  lib: FfiLibrary,
  handle: FfiOpaque
): VoiceSettings => {
  const b = bindings(lib);
  return {
    selfMute: Boolean(b.selfMute(handle)),
    selfDeaf: Boolean(b.selfDeaf(handle)),
    inputMode:
      VOICE_INPUT_MODE_BY_CODE[Number(b.inputMode(handle))] ?? `voiceActivity`,
    pttKey: readString(lib, handle, b.pttKey),
    inputVolume: Number(b.inputVolume(handle)),
    outputVolume: Number(b.outputVolume(handle)),
    automaticGainControl: Boolean(b.automaticGainControl(handle)),
    echoCancellation: Boolean(b.echoCancellation(handle)),
    noiseSuppression: Boolean(b.noiseSuppression(handle)),
    noiseCancellation: Boolean(b.noiseCancellation(handle))
  };
};

/**
 * Fetch the user's current voice settings from the connected Discord desktop client.
 *
 * Requires a running Discord desktop client and an approved Social SDK integration. Rejects if the client refuses the request, or if nothing answers within `timeoutMs`.
 */
export const getVoiceSettings = async (
  options: VoiceOptions = {}
): Promise<VoiceSettings> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  return awaitResult<VoiceSettings>(
    client,
    b.getCb,
    (ptr) => b.get(client.handle, ptr, null, null),
    (settings) => readVoiceSettings(client.lib, settings),
    { timeoutMs: options.timeoutMs, label: `get voice settings` }
  );
};

/**
 * Subscribe to the user's voice settings changing in the connected Discord desktop client. The handler receives a fresh {@link VoiceSettings} snapshot each time. Returns an unsubscribe / `Disposable`. Single client-wide callback (re-subscribing replaces it), so call once.
 *
 * Requires the same access as {@link getVoiceSettings}. The handler never fires if the Discord client refuses the subscription.
 */
export const onVoiceSettingsUpdated = (
  handler: (settings: VoiceSettings) => void,
  options: { client?: DiscordClient } = {}
): Subscription => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  const cb = client.lib.registerCallback(b.updatedCb, (settings: unknown) => {
    handler(readVoiceSettings(client.lib, settings));
  });
  client.trackCallback(cb);
  b.setUpdatedCb(client.handle, cb, null, null);
  return toSubscription(() => client.lib.unregisterCallback(cb));
};
