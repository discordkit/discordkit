import { describe, it, expect } from "vite-plus/test";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import {
  fireVoiceSettingsUpdated,
  makeVoiceSettings,
  scriptVoiceSettings
} from "./mock.js";
import { getVoiceSettings, onVoiceSettingsUpdated } from "../voiceSettings.js";
import type { VoiceSettings } from "../types.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`voice settings of the Discord client (mock backend)`, () => {
  it(`resolves with a plain snapshot of every setting`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptVoiceSettings(
      state,
      makeVoiceSettings({
        selfMute: true,
        inputMode: 1,
        pttKey: `SHIFT + F`,
        inputVolume: 75,
        outputVolume: 150,
        noiseCancellation: true
      })
    );

    // Why: the SDK hands back a handle that is only valid inside its callback, so every field has to be read out into a plain object before the promise resolves. The input mode also crosses the ABI as an integer, and has to arrive as the public string form.
    await expect(getVoiceSettings({ client })).resolves.toEqual({
      selfMute: true,
      selfDeaf: false,
      inputMode: `pushToTalk`,
      pttKey: `SHIFT + F`,
      inputVolume: 75,
      outputVolume: 150,
      automaticGainControl: true,
      echoCancellation: true,
      noiseSuppression: true,
      noiseCancellation: true
    });
  });

  it(`reports an unbound push-to-talk key as an empty string`, async () => {
    using client = createClient(config);
    scriptVoiceSettings(mockStateOf(client.lib), makeVoiceSettings());

    // Why: a user on voice activity has no key bound. The SDK documents that as an empty string, and a caller rendering "press <key> to talk" needs to tell it apart from a key.
    const settings = await getVoiceSettings({ client });
    expect(settings.inputMode).toBe(`voiceActivity`);
    expect(settings.pttKey).toBe(``);
  });

  it(`delivers a fresh snapshot each time the settings change, until unsubscribed`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    const seen: VoiceSettings[] = [];
    const subscription = onVoiceSettingsUpdated(
      (settings) => seen.push(settings),
      { client }
    );

    fireVoiceSettingsUpdated(state, makeVoiceSettings({ selfMute: true }));
    fireVoiceSettingsUpdated(state, makeVoiceSettings({ selfDeaf: true }));

    // Why: this is how an overlay keeps a mute indicator in step with Discord without polling. Each event carries its own handle, so each must be read into its own snapshot.
    expect(seen.map((s) => [s.selfMute, s.selfDeaf])).toEqual([
      [true, false],
      [false, true]
    ]);

    subscription[Symbol.dispose]();
    fireVoiceSettingsUpdated(state, makeVoiceSettings({ selfMute: true }));

    // Why: a disposed subscription must stop calling into a handler whose owner may be gone.
    expect(seen).toHaveLength(2);
  });
});
