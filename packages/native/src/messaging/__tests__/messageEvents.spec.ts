import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { fireMessageEvent } from "./mock.js";
import {
  onMessageCreated,
  onMessageUpdated,
  onMessageDeleted
} from "../messageEvents.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`message events (mock backend)`, () => {
  it(`created/updated deliver the message id to subscribers`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    const created: string[] = [];
    const updated: string[] = [];
    using _c = onMessageCreated((id) => created.push(id), { client });
    using _u = onMessageUpdated((id) => updated.push(id), { client });

    fireMessageEvent(state, `MessageCreated`, 7000n);
    fireMessageEvent(state, `MessageUpdated`, 7000n);

    // Why: created/updated are single-id events; the two subscriptions register
    // distinct callbacks and must not cross-fire.
    expect(created).toEqual([`7000`]);
    expect(updated).toEqual([`7000`]);
  });

  it(`deleted carries both the message id and its channel id`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    const seen: [string, string][] = [];
    using _s = onMessageDeleted(
      (messageId, channelId) => seen.push([messageId, channelId]),
      { client }
    );

    fireMessageEvent(state, `MessageDeleted`, 7000n, 900n);

    // Why: the deleted callback prototype has two uint64 args (the message is gone,
    // so the channel id is the only way to locate where it was).
    expect(seen).toEqual([[`7000`, `900`]]);
  });

  it(`fans out to multiple subscribers and stops on unsubscribe`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    const a: string[] = [];
    const b: string[] = [];
    const offA = onMessageCreated((id) => a.push(id), { client });
    using _b = onMessageCreated((id) => b.push(id), { client });

    fireMessageEvent(state, `MessageCreated`, 1n);
    offA();
    fireMessageEvent(state, `MessageCreated`, 2n);

    // Why: SetMessageCreatedCallback is one client-wide setter — the domain fans
    // out to all subscribers, and an unsubscribe removes only that handler.
    expect(a).toEqual([`1`]);
    expect(b).toEqual([`1`, `2`]);
  });
});
