import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { scriptLobby, fireLobbyEvent } from "./mock.js";
import {
  onLobbyMemberAdded,
  onLobbyMemberRemoved,
  onLobbyMemberUpdated,
  onLobbyCreated,
  onLobbyDeleted,
  onLobbyUpdated
} from "../lobbyEvents.js";
import { createOrJoinLobby } from "../lobbies.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`lobby events (mock backend)`, () => {
  it(`client-wide events fan out to multiple subscribers`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    const a: bigint[] = [];
    const b: bigint[] = [];
    using _sa = onLobbyCreated((id) => a.push(id), { client });
    using _sb = onLobbyCreated((id) => b.push(id), { client });

    fireLobbyEvent(state, `LobbyCreated`, 5000n);

    // Why: SetLobbyCreatedCallback is a single client-wide setter — registering
    // per-subscriber would clobber. The domain owns ONE native callback and fans
    // out, so both subscribers must receive the event.
    expect(a).toEqual([5000n]);
    expect(b).toEqual([5000n]);
  });

  it(`member events carry both lobby id and member id`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    const seen: [bigint, bigint][] = [];
    using _s = onLobbyMemberAdded(
      (lobbyId, memberId) => seen.push([lobbyId, memberId]),
      { client }
    );

    fireLobbyEvent(state, `LobbyMemberAdded`, 5000n, 11n);

    // Why: the member-event callback prototype has two uint64 args; both must be
    // delivered as bigints.
    expect(seen).toEqual([[5000n, 11n]]);
  });

  it(`lobby.onMemberAdded filters to its own lobby id`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptLobby(state, { id: 5000n, metadata: {}, members: [] });
    using lobby = await createOrJoinLobby(`s`, { client });

    const joined: bigint[] = [];
    lobby.onMemberAdded((memberId) => joined.push(memberId));

    fireLobbyEvent(state, `LobbyMemberAdded`, 9999n, 77n); // other lobby
    fireLobbyEvent(state, `LobbyMemberAdded`, 5000n, 11n); // this lobby

    // Why: the per-lobby sugar rides the client-wide fan-out but must filter by
    // this.id — a member joining a different lobby must not fire this handler.
    expect(joined).toEqual([11n]);
  });

  it(`lobby.onMemberRemoved / onMemberUpdated filter to their own lobby id`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptLobby(state, { id: 5000n, metadata: {}, members: [] });
    using lobby = await createOrJoinLobby(`s`, { client });

    const removed: bigint[] = [];
    const updated: bigint[] = [];
    lobby.onMemberRemoved((id) => removed.push(id));
    lobby.onMemberUpdated((id) => updated.push(id));

    fireLobbyEvent(state, `LobbyMemberRemoved`, 9999n, 77n); // other lobby
    fireLobbyEvent(state, `LobbyMemberRemoved`, 5000n, 22n);
    fireLobbyEvent(state, `LobbyMemberUpdated`, 5000n, 33n);

    // Why: each per-lobby member event must filter by this.id independently —
    // proving the wrapper wires every member event, not just onMemberAdded.
    expect(removed).toEqual([22n]);
    expect(updated).toEqual([33n]);
  });

  it(`lobby.onUpdated fires only for this lobby`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptLobby(state, { id: 5000n, metadata: {}, members: [] });
    using lobby = await createOrJoinLobby(`s`, { client });

    let count = 0;
    lobby.onUpdated(() => {
      count++;
    });

    fireLobbyEvent(state, `LobbyUpdated`, 9999n); // other lobby
    fireLobbyEvent(state, `LobbyUpdated`, 5000n); // this lobby

    // Why: onUpdated takes no id arg (it's "this lobby changed"), so the filter is
    // the only thing scoping it — an unfiltered impl would fire for every lobby.
    expect(count).toBe(1);
  });

  it(`unsubscribing stops delivery`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    const seen: bigint[] = [];
    const off = onLobbyCreated((id) => seen.push(id), { client });

    fireLobbyEvent(state, `LobbyCreated`, 1n);
    off();
    fireLobbyEvent(state, `LobbyCreated`, 2n);

    // Why: the Subscription must remove the handler from the fan-out set.
    expect(seen).toEqual([1n]);
  });

  // Why: all six events flow through the shared clientEventFanout config; this
  // pins each export to the right event key + arity, catching a config typo that
  // would silently route an event to the wrong handler set.
  it.each([
    [`onLobbyDeleted`, onLobbyDeleted, `LobbyDeleted`, [7n], [7n]],
    [`onLobbyUpdated`, onLobbyUpdated, `LobbyUpdated`, [7n], [7n]],
    [
      `onLobbyMemberRemoved`,
      onLobbyMemberRemoved,
      `LobbyMemberRemoved`,
      [7n, 11n],
      [7n, 11n]
    ],
    [
      `onLobbyMemberUpdated`,
      onLobbyMemberUpdated,
      `LobbyMemberUpdated`,
      [7n, 11n],
      [7n, 11n]
    ]
  ] as const)(`%s delivers its ids`, (_name, on, event, fireArgs, expected) => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    const seen: bigint[][] = [];
    using _s = (on as (h: (...a: bigint[]) => void, o: object) => Disposable)(
      (...ids: bigint[]) => seen.push(ids),
      { client }
    );
    fireLobbyEvent(
      state,
      event as Parameters<typeof fireLobbyEvent>[1],
      ...fireArgs
    );
    expect(seen).toEqual([[...expected]]);
  });
});
