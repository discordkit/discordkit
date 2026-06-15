import { Signal } from "signal-polyfill";
import type { AudioDevice } from "@discordkit/native/voice";
import type { VoiceBridge } from "../channels/voice.js";

/** The bridge slice this signal needs — a structural subset of {@link VoiceBridge}. */
type DevicesSource = Pick<
  VoiceBridge,
  `getInputDevices` | `getOutputDevices` | `onDeviceChange`
>;

/** The current input + output audio devices. */
export interface AudioDevices {
  input: AudioDevice[];
  output: AudioDevice[];
}

/**
 * A TC39 `Signal.State<AudioDevices>` tracking the available audio input + output
 * devices — framework-agnostic reactive state for a device-picker UI. Seeds from
 * `getInputDevices()`/`getOutputDevices()` once, then updates on each
 * `onDeviceChange` event (e.g. a headset plugged in). Same consumption model as
 * {@link statusSignal}: read `.get()`, react via the native `subscribe`.
 *
 * @example
 * ```ts
 * import { devicesSignal } from "@discordkit/electron/signals";
 * import { subscribe } from "@discordkit/native";
 *
 * const devices = devicesSignal(window.discord.voice);
 * using off = subscribe(devices, ({ input }) => renderMicPicker(input));
 * devices.get().output; // current speakers, synchronously
 * ```
 */
export const devicesSignal = (
  voice: DevicesSource
): Signal.State<AudioDevices> => {
  const state = new Signal.State<AudioDevices>({ input: [], output: [] });
  // Push updates from the live device-change stream.
  voice.onDeviceChange((devices) => state.set(devices));
  // Pull the current device lists once to seed.
  void (async () => {
    const [input, output] = await Promise.all([
      voice.getInputDevices(),
      voice.getOutputDevices()
    ]);
    state.set({ input, output });
  })();
  return state;
};
