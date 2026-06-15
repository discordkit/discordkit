import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import {
  makeMessage,
  scriptMessage,
  scriptChannel,
  scriptHistory,
  scriptSummaries
} from "./mock.js";
import {
  getMessage,
  getChannel,
  getUserMessages,
  getLobbyMessages,
  getUserMessageSummaries,
  canOpenMessageInDiscord,
  openMessageInDiscord
} from "../messages.js";
import { userId, lobbyId, channelId, messageId } from "../../__tests__/ids.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`read messages (mock backend)`, () => {
  it(`getMessage reads the full snapshot, embedding author + channel + metadata`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptMessage(
      state,
      makeMessage({
        id: 7000n,
        content: `gg @ada`,
        rawContent: `gg <@11>`,
        authorId: 11n,
        author: {
          id: 11n,
          username: `ada`,
          displayName: `Ada`,
          status: 0,
          provisional: false
        },
        channelId: 900n,
        channel: { id: 900n, name: `team`, type: 1, recipientIds: [11n, 22n] },
        lobbyId: 5000n,
        metadata: { char: `mage` },
        additionalContent: { type: 1, count: 2, title: undefined }
      })
    );

    const msg = getMessage(messageId(7000n), { client });

    // Why: a message is a read-once snapshot — every field must read out, including
    // the humanized vs raw content split, the embedded author/channel, the lobby
    // id (read WITHOUT wrapping a live Lobby), and unrenderable additionalContent.
    expect(msg).toMatchObject({
      id: 7000n,
      content: `gg @ada`,
      rawContent: `gg <@11>`,
      authorId: 11n,
      channelId: 900n,
      lobbyId: 5000n,
      metadata: { char: `mage` }
    });
    expect(msg?.author?.username).toBe(`ada`);
    expect(msg?.channel).toMatchObject({ name: `team`, type: `dm` });
    expect(msg?.additionalContent).toMatchObject({
      type: `attachment`,
      count: 2
    });
  });

  it(`getMessage returns undefined when the SDK no longer has the message`, () => {
    using client = createClient(config);
    mockStateOf(client.lib);
    // Why: GetMessageHandle is bool-gated (SDK keeps only 25 per channel); a
    // missing message must yield undefined, not a wrapper around an invalid handle.
    expect(getMessage(messageId(404n), { client })).toBeUndefined();
  });

  it(`getChannel reads a Channel snapshot with recipient ids`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptChannel(state, {
      id: 900n,
      name: `dm`,
      type: 1,
      recipientIds: [11n, 22n]
    });
    const channel = getChannel(channelId(900n), { client });
    // Why: recipientIds uses the scalar-id span primitive; type maps via the
    // shared ChannelType table.
    expect(channel).toEqual({
      id: 900n,
      name: `dm`,
      type: `dm`,
      recipientIds: [11n, 22n]
    });
  });

  it(`getUserMessages resolves with the recent history as snapshots`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptHistory(state, [
      makeMessage({ id: 1n, content: `a` }),
      makeMessage({ id: 2n, content: `b` })
    ]);
    const history = await getUserMessages(userId(11n), 25, { client });
    // Why: history resolves with a message-handle span read into snapshots.
    expect(history.map((m) => m.content)).toEqual([`a`, `b`]);
  });

  it(`getUserMessageSummaries resolves with DM conversation summaries`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptSummaries(state, [
      { userId: 11n, lastMessageId: 100n },
      { userId: 22n, lastMessageId: 200n }
    ]);
    const summaries = await getUserMessageSummaries({ client });
    // Why: summaries read off a distinct span element type (UserMessageSummary).
    expect(summaries).toEqual([
      { userId: 11n, lastMessageId: 100n },
      { userId: 22n, lastMessageId: 200n }
    ]);
  });

  it(`getLobbyMessages resolves with the lobby's recent history`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptHistory(state, [makeMessage({ id: 9n, content: `team up?` })]);
    // Why: lobby history is a distinct C function from DM history but shares the
    // message-span callback shape — it must read into the same snapshots.
    const history = await getLobbyMessages(lobbyId(5000n), 25, { client });
    expect(history.map((m) => m.content)).toEqual([`team up?`]);
  });

  it(`openMessageInDiscord resolves and canOpen gates it`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    // Why: OpenMessageInDiscord has a TWO-callback signature (a provisional-merge
    // cb + the result cb) — the op must fire the RESULT cb (not the merge one) to
    // resolve. canOpenMessageInDiscord is a separate sync gate.
    expect(canOpenMessageInDiscord(messageId(7000n), { client })).toBe(true);
    await openMessageInDiscord(messageId(7000n), { client });
    expect(state.calls).toContain(`Discord_Client_OpenMessageInDiscord`);
  });
});
