import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { relationshipActionsOf } from "./mock.js";
import {
  blockUser,
  unblockUser,
  acceptDiscordFriendRequest,
  acceptGameFriendRequest,
  rejectDiscordFriendRequest,
  rejectGameFriendRequest,
  cancelDiscordFriendRequest,
  cancelGameFriendRequest,
  removeFriend,
  removeGameFriend,
  sendDiscordFriendRequest,
  sendGameFriendRequest,
  sendDiscordFriendRequestById,
  sendGameFriendRequestById
} from "../relationships.js";
import { userId } from "../../__tests__/ids.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`relationship actions (mock backend)`, () => {
  it(`userId actions resolve when the SDK acks, calling the right C function`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await blockUser(userId(99n), { client });
    await unblockUser(userId(99n), { client });
    await acceptDiscordFriendRequest(userId(42n), { client });
    await removeFriend(userId(42n), { client });
    await sendGameFriendRequestById(userId(7n), { client });
    // Why: every action funnels through the same awaitResult bridge; this proves
    // each export wires to its own C function and resolves on the result ack.
    expect(relationshipActionsOf(state)).toEqual([
      `Discord_Client_BlockUser`,
      `Discord_Client_UnblockUser`,
      `Discord_Client_AcceptDiscordFriendRequest`,
      `Discord_Client_RemoveDiscordAndGameFriend`,
      `Discord_Client_SendGameFriendRequestById`
    ]);
  });

  it(`username sends go through the SendFriendRequest path`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    // Why: by-username sends use a different callback prototype than by-id ops;
    // they must still resolve via awaitResult.
    await sendDiscordFriendRequest(`ada#0001`, { client });
    expect(relationshipActionsOf(state)).toContain(
      `Discord_Client_SendDiscordFriendRequest`
    );
  });

  // Why: every userId-keyed action is produced by the same `action()` factory, so
  // the risk isn't the bridge (covered above) but a WIRING mistake — an export
  // pointing at the wrong C function. This table pins each export to its binding,
  // which is exactly the kind of off-by-one a literal map prevents.
  it.each([
    [
      `acceptGameFriendRequest`,
      acceptGameFriendRequest,
      `Discord_Client_AcceptGameFriendRequest`
    ],
    [
      `rejectDiscordFriendRequest`,
      rejectDiscordFriendRequest,
      `Discord_Client_RejectDiscordFriendRequest`
    ],
    [
      `rejectGameFriendRequest`,
      rejectGameFriendRequest,
      `Discord_Client_RejectGameFriendRequest`
    ],
    [
      `cancelDiscordFriendRequest`,
      cancelDiscordFriendRequest,
      `Discord_Client_CancelDiscordFriendRequest`
    ],
    [
      `cancelGameFriendRequest`,
      cancelGameFriendRequest,
      `Discord_Client_CancelGameFriendRequest`
    ],
    [`removeGameFriend`, removeGameFriend, `Discord_Client_RemoveGameFriend`],
    [
      `sendDiscordFriendRequestById`,
      sendDiscordFriendRequestById,
      `Discord_Client_SendDiscordFriendRequestById`
    ],
    [
      `sendGameFriendRequestById`,
      sendGameFriendRequestById,
      `Discord_Client_SendGameFriendRequestById`
    ]
  ] as const)(
    `%s calls its own C function and resolves`,
    async (_name, op, cFunction) => {
      using client = createClient(config);
      const state = mockStateOf(client.lib);
      await op(userId(42n), { client });
      expect(relationshipActionsOf(state)).toEqual([cFunction]);
    }
  );

  it(`sendGameFriendRequest (by username) maps to its own C function`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await sendGameFriendRequest(`grace#0002`, { client });
    expect(relationshipActionsOf(state)).toContain(
      `Discord_Client_SendGameFriendRequest`
    );
  });
});
