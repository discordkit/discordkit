import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import {
  makeCall,
  scriptCall,
  fireCallEvent,
  fireDeviceChange
} from "./mock.js";
import { getCall, onDeviceChange } from "../calls.js";
import type { CallStatus } from "../types.js";
import { channelId } from "../../__tests__/ids.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`call events (mock backend)`, () => {
  it(`onStatusChanged maps the ABI status to the public form`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptCall(state, makeCall());
    using call = getCall(channelId(5000n), { client })!;

    const seen: CallStatus[] = [];
    call.onStatusChanged((s) => seen.push(s));
    fireCallEvent(state, `StatusChanged`, 5, 0, 0); // reconnecting

    // Why: a Call's events are per-call setters on the handle (not client-wide);
    // the status code must map to the public string form.
    expect(seen).toEqual([`reconnecting`]);
  });

  it(`onParticipantChanged delivers userId + added`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptCall(state, makeCall());
    using call = getCall(channelId(5000n), { client })!;

    const joins: [string, boolean][] = [];
    call.onParticipantChanged((id, added) => joins.push([id, added]));
    fireCallEvent(state, `ParticipantChanged`, 11n, true);
    fireCallEvent(state, `ParticipantChanged`, 22n, false);

    expect(joins).toEqual([
      [`11`, true],
      [`22`, false]
    ]);
  });

  it(`onSpeakingStatusChanged delivers userId + speaking`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptCall(state, makeCall());
    using call = getCall(channelId(5000n), { client })!;

    const speaking: [string, boolean][] = [];
    call.onSpeakingStatusChanged((id, on) => speaking.push([id, on]));
    fireCallEvent(state, `SpeakingStatusChanged`, 11n, true);

    expect(speaking).toEqual([[`11`, true]]);
  });

  it(`disposing a Call unregisters its event callbacks`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptCall(state, makeCall());
    const call = getCall(channelId(5000n), { client })!;

    const seen: string[] = [];
    call.onVoiceStateChanged((id) => seen.push(id));
    fireCallEvent(state, `VoiceStateChanged`, 11n);
    call[Symbol.dispose]();
    fireCallEvent(state, `VoiceStateChanged`, 22n);

    // Why: a Call owns its per-call callbacks; dispose must unregister them so a
    // post-dispose event doesn't reach a stale handler.
    expect(seen).toEqual([`11`]);
  });

  it(`onDeviceChange delivers the new input + output device lists`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    let latest:
      | { input: { id: string }[]; output: { id: string }[] }
      | undefined;
    using _s = onDeviceChange(
      (d) => {
        latest = d;
      },
      { client }
    );

    fireDeviceChange(
      state,
      [{ id: `mic-2`, name: `New Mic`, isDefault: true }],
      [{ id: `spk-1`, name: `Headphones`, isDefault: true }]
    );

    // Why: the device-change event carries TWO spans (input + output); both must
    // read into AudioDevice snapshots.
    expect(latest?.input.map((d) => d.id)).toEqual([`mic-2`]);
    expect(latest?.output.map((d) => d.id)).toEqual([`spk-1`]);
  });
});
