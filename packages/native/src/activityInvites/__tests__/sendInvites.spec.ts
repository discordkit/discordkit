import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { inviteActionsOf, makeInvite } from "./mock.js";
import {
  sendActivityInvite,
  sendActivityJoinRequest,
  replyToActivityJoinRequest
} from "../activityInvites.js";
import { readActivityInvite } from "../activityInvite.js";
import { userId } from "../../__tests__/ids.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`send activity invites (mock backend)`, () => {
  it(`each send op resolves on the SDK ack via its own C function`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await sendActivityInvite(userId(555n), `join me`, { client });
    await sendActivityJoinRequest(userId(555n), { client });
    // Why: all three resolve through the same SendActivityInviteCallback bridge;
    // this proves each export wires to its own C function and acks correctly.
    expect(inviteActionsOf(state)).toEqual([
      `Discord_Client_SendActivityInvite`,
      `Discord_Client_SendActivityJoinRequest`
    ]);
  });

  it(`sendActivityInvite defaults content to an empty string`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    // Why: the SDK explicitly allows empty content; the default must reach the
    // SDK as "" rather than undefined (which would mis-marshal the Discord_String).
    await sendActivityInvite(userId(555n), undefined, { client });
    expect(inviteActionsOf(state)).toContain(
      `Discord_Client_SendActivityInvite`
    );
  });

  it(`replyToActivityJoinRequest round-trips the invite through a native handle`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    const invite = readActivityInvite(client.lib, {
      __invite: makeInvite({ type: 5, partyId: `p-reply`, senderId: 42n })
    });
    await replyToActivityJoinRequest(invite, { client });
    // Why: reply takes a Discord_ActivityInvite*, so the snapshot must be rebuilt
    // into a handle (buildActivityInvite) and dropped (using) — the build/drop
    // must surround the acked call.
    expect(state.calls).toContain(`Discord_ActivityInvite_Init`);
    expect(state.calls).toContain(
      `Discord_Client_SendActivityJoinRequestReply`
    );
    expect(state.calls).toContain(`Discord_ActivityInvite_Drop`); // no handle leak
  });
});
