import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import {
  makeInvite,
  scriptJoinSecret,
  builtInviteOf,
  inviteActionsOf
} from "./mock.js";
import { acceptActivityInvite } from "../activityInvites.js";
import { readActivityInvite, buildActivityInvite } from "../activityInvite.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`accept activity invite (mock backend)`, () => {
  it(`resolves with the join secret from the accept callback`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptJoinSecret(state, `secret-xyz`);
    const invite = readActivityInvite(client.lib, { __invite: makeInvite() });

    const joinSecret = await acceptActivityInvite(invite, { client });

    // Why: accept is the ONE op whose callback carries a value — the join secret
    // a game feeds into its party system. Resolving with anything else (or void)
    // breaks the whole join flow, so the post-result arg mapping must be exact.
    expect(joinSecret).toBe(`secret-xyz`);
    expect(inviteActionsOf(state)).toContain(
      `Discord_Client_AcceptActivityInvite`
    );
    expect(state.calls).toContain(`Discord_ActivityInvite_Drop`); // no handle leak
  });

  it(`readActivityInvite ⇄ buildActivityInvite preserves every field`, () => {
    using client = createClient(config);
    const original = makeInvite({
      type: 5,
      senderId: 11n,
      channelId: 22n,
      messageId: 33n,
      applicationId: 44n,
      parentApplicationId: 55n,
      partyId: `party-rt`,
      sessionId: `session-rt`,
      valid: false
    });

    // Build a snapshot from a scripted handle, marshal it back, and re-read.
    const snapshot = readActivityInvite(client.lib, { __invite: original });
    using built = buildActivityInvite(client.lib, snapshot);
    const roundTripped = readActivityInvite(client.lib, built.handle);

    // Why: accept/reply rely on a lossless snapshot↔handle round-trip. A dropped
    // or mis-typed field (e.g. the non-contiguous ActivityActionTypes enum, where
    // joinRequest=5 not 2) would silently send the wrong invite.
    expect(roundTripped).toEqual(snapshot);
    expect(roundTripped.type).toBe(`joinRequest`);
    expect(builtInviteOf(built.handle)?.type).toBe(5);
  });
});
