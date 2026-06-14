import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { makeInvite, fireActivityInvite } from "./mock.js";
import {
  onActivityInviteCreated,
  onActivityInviteUpdated
} from "../activityInvites.js";
import type { ActivityInvite } from "../types.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`activity invite subscriptions (mock backend)`, () => {
  it(`delivers parsed invites to the created handler as snapshots`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    const received: ActivityInvite[] = [];
    using _sub = onActivityInviteCreated((i) => received.push(i), { client });

    fireActivityInvite(
      state,
      `created`,
      makeInvite({ type: 5, senderId: 42n, partyId: `p-99` })
    );

    // Why: a subscription is a persistent event stream (not a promise) — the SDK
    // fires it with a native handle, which we must read into a plain snapshot
    // before handing to the consumer. Wrong enum/field mapping here misrenders
    // every incoming invite.
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({
      type: `joinRequest`,
      senderId: 42n,
      partyId: `p-99`
    });
  });

  it(`updated subscription is independent of created`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    const created: ActivityInvite[] = [];
    const updated: ActivityInvite[] = [];
    using _c = onActivityInviteCreated((i) => created.push(i), { client });
    using _u = onActivityInviteUpdated((i) => updated.push(i), { client });

    fireActivityInvite(state, `updated`, makeInvite({ valid: false }));

    // Why: the two subscriptions register distinct callbacks; an update must not
    // leak into the created handler (and vice versa).
    expect(created).toHaveLength(0);
    expect(updated).toHaveLength(1);
    expect(updated[0]?.valid).toBe(false);
  });

  it(`unsubscribing stops delivery`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    const received: ActivityInvite[] = [];
    const off = onActivityInviteCreated((i) => received.push(i), { client });

    fireActivityInvite(state, `created`, makeInvite());
    off();
    fireActivityInvite(state, `created`, makeInvite());

    // Why: the returned Subscription must actually unregister the callback —
    // otherwise consumers leak handlers for the client's lifetime.
    expect(received).toHaveLength(1);
  });
});
