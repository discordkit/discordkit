import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { relationshipActionsOf } from "./mock.js";
import {
  blockUser,
  unblockUser,
  acceptDiscordFriendRequest,
  removeFriend,
  sendDiscordFriendRequest,
  sendGameFriendRequestById
} from "../relationships.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`relationship actions (mock backend)`, () => {
  it(`userId actions resolve when the SDK acks, calling the right C function`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await blockUser(99n, { client });
    await unblockUser(99n, { client });
    await acceptDiscordFriendRequest(42n, { client });
    await removeFriend(42n, { client });
    await sendGameFriendRequestById(7n, { client });
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
});
