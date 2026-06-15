import { defineBindings } from "../ffi/bindings.js";
import { readString } from "../ffi/readers.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";
import type { AudioDevice, VADThreshold, VoiceState } from "./types.js";

/**
 * Bindings + snapshot readers for the voice domain's read-only value handles: `discordpp::VoiceStateHandle` (a participant's self-mute/deaf), `discordpp::AudioDevice` (an input/output device), and `discordpp::VADThresholdSettings` (a call's VAD config). All read once into plain snapshots — only the `Call` itself is a live wrapper.
 */
const voiceState = defineBindings({
  selfMute: /* C */ `bool Discord_VoiceStateHandle_SelfMute(void *self)`,
  selfDeaf: /* C */ `bool Discord_VoiceStateHandle_SelfDeaf(void *self)`
});

const audioDevice = defineBindings({
  isDefault: /* C */ `bool Discord_AudioDevice_IsDefault(void *self)`,
  id: /* C */ `void Discord_AudioDevice_Id(void *self, Discord_String *returnValue)`,
  name: /* C */ `void Discord_AudioDevice_Name(void *self, Discord_String *returnValue)`
});

const vad = defineBindings({
  automatic: /* C */ `bool Discord_VADThresholdSettings_Automatic(void *self)`,
  threshold: /* C */ `float Discord_VADThresholdSettings_VadThreshold(void *self)`
});

/** Read a native `VoiceStateHandle` into a plain {@link VoiceState} snapshot. */
export const readVoiceState = (
  lib: FfiLibrary,
  handle: FfiOpaque
): VoiceState => {
  const b = voiceState(lib);
  return {
    selfMute: Boolean(b.selfMute(handle)),
    selfDeaf: Boolean(b.selfDeaf(handle))
  };
};

/** Read a native `AudioDevice` into a plain {@link AudioDevice} snapshot. */
export const readAudioDevice = (
  lib: FfiLibrary,
  handle: FfiOpaque
): AudioDevice => {
  const b = audioDevice(lib);
  return {
    id: readString(lib, handle, b.id),
    name: readString(lib, handle, b.name),
    isDefault: Boolean(b.isDefault(handle))
  };
};

/** Read a native `VADThresholdSettings` into a plain {@link VADThreshold} snapshot. */
export const readVADThreshold = (
  lib: FfiLibrary,
  handle: FfiOpaque
): VADThreshold => {
  const b = vad(lib);
  return {
    automatic: Boolean(b.automatic(handle)),
    threshold: Number(b.threshold(handle))
  };
};
