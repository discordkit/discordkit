import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { scriptDevices, scriptCurrentDevices, voiceActionsOf } from "./mock.js";
import {
  getInputVolume,
  setInputVolume,
  setOutputVolume,
  getOutputVolume,
  isSelfMuted,
  setSelfMuteAll,
  isSelfDeafened,
  setSelfDeafAll,
  getInputDevices,
  getOutputDevices,
  getCurrentInputDevice,
  getCurrentOutputDevice,
  setInputDevice,
  setOutputDevice
} from "../calls.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`client audio (mock backend)`, () => {
  it(`input/output volume round-trip synchronously`, () => {
    using client = createClient(config);
    mockStateOf(client.lib);
    // Why: volume getters/setters are direct sync calls (float), no callback.
    setInputVolume(80, { client });
    setOutputVolume(150, { client });
    expect(getInputVolume({ client })).toBe(80);
    expect(getOutputVolume({ client })).toBe(150);
  });

  it(`mute-all / deaf-all round-trip synchronously across calls`, () => {
    using client = createClient(config);
    mockStateOf(client.lib);
    setSelfMuteAll(true, { client });
    setSelfDeafAll(true, { client });
    // Why: these are the global (cross-call) toggles, distinct from a Call's own
    // self-mute; they're synchronous bool getters/setters.
    expect(isSelfMuted({ client })).toBe(true);
    expect(isSelfDeafened({ client })).toBe(true);
  });

  it(`device enumeration resolves with AudioDevice snapshots (no-result callback)`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptDevices(
      state,
      [
        { id: `mic-1`, name: `Headset Mic`, isDefault: true },
        { id: `mic-2`, name: `Webcam Mic`, isDefault: false }
      ],
      [{ id: `spk-1`, name: `Headphones`, isDefault: true }]
    );

    const inputs = await getInputDevices({ client });
    const outputs = await getOutputDevices({ client });

    // Why: device-enum callbacks carry a span and NO result — they go through
    // awaitCallback, and the span reads into AudioDevice snapshots.
    expect(inputs).toEqual([
      { id: `mic-1`, name: `Headset Mic`, isDefault: true },
      { id: `mic-2`, name: `Webcam Mic`, isDefault: false }
    ]);
    expect(outputs).toEqual([
      { id: `spk-1`, name: `Headphones`, isDefault: true }
    ]);
  });

  it(`getCurrent input/output device resolve with the selected device (or undefined)`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptCurrentDevices(
      state,
      { id: `mic-1`, name: `Headset Mic`, isDefault: true },
      undefined
    );

    // Why: the current-device callbacks carry a single optional device (no span,
    // no result) — a present device reads into a snapshot; none → undefined.
    await expect(getCurrentInputDevice({ client })).resolves.toEqual({
      id: `mic-1`,
      name: `Headset Mic`,
      isDefault: true
    });
    await expect(getCurrentOutputDevice({ client })).resolves.toBeUndefined();
  });

  it.each([
    [`setInputDevice`, setInputDevice, `Discord_Client_SetInputDevice`],
    [`setOutputDevice`, setOutputDevice, `Discord_Client_SetOutputDevice`]
  ] as const)(`%s resolves via its result callback`, async (_n, op, cFn) => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    // Why: unlike enumeration, set*Device DOES carry a ClientResult, so it uses
    // awaitResult (success/fail), not awaitCallback — and each export must wire to
    // its own C function.
    await op(`dev-2`, { client });
    expect(voiceActionsOf(state)).toContain(cFn);
  });
});
