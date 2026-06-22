import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { scriptNextMessageId, messageActionsOf } from "./mock.js";
import {
  sendUserMessage,
  sendLobbyMessage,
  editUserMessage,
  deleteUserMessage
} from "../messages.js";
import { userId, lobbyId, messageId } from "../../__tests__/ids.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`send/edit/delete messages (mock backend)`, () => {
  it(`sendUserMessage resolves with the new message id`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptNextMessageId(state, 7777n);
    // Why: the send callback carries the new message id — the op must resolve
    // with that id (so callers can re-fetch via getMessage), not void.
    const id = await sendUserMessage(userId(11n), `hello`, { client });
    expect(id).toBe(`7777`);
    expect(messageActionsOf(state)).toContain(`Discord_Client_SendUserMessage`);
  });

  it(`metadata routes user + lobby sends to the WithMetadata C functions`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await sendUserMessage(userId(11n), `hi`, {
      client,
      metadata: { char: `mage` }
    });
    await sendLobbyMessage(lobbyId(5000n), `hi all`, {
      client,
      metadata: { channel: `team` }
    });
    // Why: passing metadata must select the distinct WithMetadata entry points
    // (which marshal a Discord_Properties), not the plain ones.
    expect(messageActionsOf(state)).toEqual(
      expect.arrayContaining([
        `Discord_Client_SendUserMessageWithMetadata`,
        `Discord_Client_SendLobbyMessageWithMetadata`
      ])
    );
  });

  it(`sendLobbyMessage without metadata uses the plain C function`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await sendLobbyMessage(lobbyId(5000n), `hi`, { client });
    expect(messageActionsOf(state)).toContain(
      `Discord_Client_SendLobbyMessage`
    );
    expect(messageActionsOf(state)).not.toContain(
      `Discord_Client_SendLobbyMessageWithMetadata`
    );
  });

  it(`edit/delete are DM-keyed and resolve on ack`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await editUserMessage(userId(11n), messageId(7000n), `edited`, { client });
    await deleteUserMessage(userId(11n), messageId(7000n), { client });
    // Why: edit/delete take (recipientId, messageId) — the C ABI only exposes
    // them for DMs — and ack via a result-only callback.
    expect(messageActionsOf(state)).toEqual([
      `Discord_Client_EditUserMessage`,
      `Discord_Client_DeleteUserMessage`
    ]);
  });
});
