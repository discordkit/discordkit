import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { makeCall, scriptCall, voiceActionsOf } from "./mock.js";
import { startCall, getCall, getCalls, endCall } from "../calls.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`calls (mock backend)`, () => {
  it(`startCall returns a live Call synchronously (no callback)`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptCall(state, makeCall({ channelId: 5000n }));

    const call = startCall(5000n, { client });

    // Why: StartCall is sync (bool + out-param), unlike createOrJoinLobby — it
    // must return a Call immediately, not a promise.
    expect(call?.channelId).toBe(5000n);
    expect(voiceActionsOf(state)).toContain(`Discord_Client_StartCall`);
  });

  it(`startCall returns undefined when the SDK can't start it`, () => {
    using client = createClient(config);
    mockStateOf(client.lib);
    expect(startCall(404n, { client })).toBeUndefined();
  });

  it(`call getters re-read live state (status, participants, mode, vad)`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptCall(
      state,
      makeCall({
        status: 4,
        participants: [11n, 22n, 33n],
        audioMode: 2,
        vad: { automatic: false, threshold: -45 },
        voiceStates: { "11": { selfMute: true, selfDeaf: false } }
      })
    );
    const call = getCall(5000n, { client });

    // Why: a Call is a live wrapper — every getter reads the SDK on access and
    // maps the ABI enums to public string forms.
    expect(call?.status).toBe(`connected`);
    expect(call?.participants).toEqual([11n, 22n, 33n]);
    expect(call?.audioMode).toBe(`pushToTalk`);
    expect(call?.vadThreshold).toEqual({ automatic: false, threshold: -45 });
    expect(call?.voiceState(11n)).toEqual({ selfMute: true, selfDeaf: false });
    expect(call?.voiceState(999n)).toBeUndefined();
  });

  it(`call setters round-trip through the SDK (self mute/deaf, audio mode, vad)`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptCall(state, makeCall());
    const call = getCall(5000n, { client })!;

    call.setSelfMute(true);
    call.setSelfDeaf(true);
    call.setAudioMode(`pushToTalk`);
    call.setVADThreshold(false, -30);

    // Why: setters must marshal correctly (AudioMode string→enum) and the live
    // getters must then reflect the change — proving the round-trip.
    expect(call.selfMute).toBe(true);
    expect(call.selfDeaf).toBe(true);
    expect(call.audioMode).toBe(`pushToTalk`);
    expect(call.vadThreshold).toEqual({ automatic: false, threshold: -30 });
  });

  it(`getCalls returns every active call as a wrapper`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptCall(state, makeCall({ channelId: 5000n }));
    scriptCall(state, makeCall({ channelId: 6000n }));
    expect(getCalls({ client }).map((c) => c.channelId)).toEqual([
      5000n,
      6000n
    ]);
  });

  it(`endCall resolves via its no-result callback`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptCall(state, makeCall());
    // Why: EndCallCallback carries no ClientResult — it uses awaitCallback, which
    // resolves on the bare callback invocation (no success/fail gating).
    await endCall(5000n, { client });
    expect(voiceActionsOf(state)).toContain(`Discord_Client_EndCall`);
  });
});
