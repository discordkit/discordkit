import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { makeCall, scriptCall, voiceActionsOf } from "./mock.js";
import { startCall, getCall, getCalls, endCall, endCalls } from "../calls.js";
import { userId, channelId } from "../../__tests__/ids.js";

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

    const call = startCall(channelId(5000n), { client });

    // Why: StartCall is sync (bool + out-param), unlike createOrJoinLobby — it
    // must return a Call immediately, not a promise.
    expect(call?.channelId).toBe(`5000`);
    expect(voiceActionsOf(state)).toContain(`Discord_Client_StartCall`);
  });

  it(`startCall returns undefined when the SDK can't start it`, () => {
    using client = createClient(config);
    mockStateOf(client.lib);
    expect(startCall(channelId(404n), { client })).toBeUndefined();
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
    const call = getCall(channelId(5000n), { client });

    // Why: a Call is a live wrapper — every getter reads the SDK on access and
    // maps the ABI enums to public string forms.
    expect(call?.status).toBe(`connected`);
    expect(call?.participants).toEqual([`11`, `22`, `33`]);
    expect(call?.audioMode).toBe(`pushToTalk`);
    expect(call?.vadThreshold).toEqual({ automatic: false, threshold: -45 });
    expect(call?.voiceState(userId(11n))).toEqual({
      selfMute: true,
      selfDeaf: false
    });
    expect(call?.voiceState(userId(999n))).toBeUndefined();
  });

  it(`call setters round-trip through the SDK (self mute/deaf, audio mode, vad)`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptCall(state, makeCall());
    const call = getCall(channelId(5000n), { client })!;

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
      `5000`,
      `6000`
    ]);
  });

  it(`endCall resolves via its no-result callback`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptCall(state, makeCall());
    // Why: EndCallCallback carries no ClientResult — it uses awaitCallback, which
    // resolves on the bare callback invocation (no success/fail gating).
    await endCall(channelId(5000n), { client });
    expect(voiceActionsOf(state)).toContain(`Discord_Client_EndCall`);
  });

  it(`endCalls ends every active call`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    // Why: endCalls is a distinct C function (no channelId) sharing the same
    // no-result callback shape — it must wire correctly and resolve.
    await endCalls({ client });
    expect(voiceActionsOf(state)).toContain(`Discord_Client_EndCalls`);
  });

  it(`per-participant local mute + volume round-trip through the SDK`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptCall(state, makeCall());
    const call = getCall(channelId(5000n), { client })!;

    // Why: local mute / volume are per-USER controls (keyed by userId), distinct
    // from the call-wide self mute. They must marshal the userId + value and the
    // getters must reflect the SDK state per user — a mis-keyed write would mute
    // the wrong person.
    expect(call.localMute(userId(11n))).toBe(false);
    expect(call.participantVolume(userId(11n))).toBe(100); // SDK default
    call.setLocalMute(userId(11n), true);
    call.setParticipantVolume(userId(11n), 175);
    expect(call.localMute(userId(11n))).toBe(true);
    expect(call.localMute(userId(22n))).toBe(false); // unaffected
    expect(call.participantVolume(userId(11n))).toBe(175);
  });

  it(`setPushToTalkActive marshals to the SDK`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptCall(state, makeCall({ audioMode: 2 })); // push-to-talk
    const call = getCall(channelId(5000n), { client })!;
    // Why: PTT is keyed by the game on its own keybind; setPushToTalkActive(true)
    // on press / (false) on release is the only way the SDK opens the mic in PTT
    // mode — it must reach the SDK.
    call.setPushToTalkActive(true);
    expect(state.calls).toContain(`Discord_Call_SetPTTActive`);
  });
});
