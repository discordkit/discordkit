import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { scriptLobby, lobbyActionsOf, type ScriptedLobby } from "./mock.js";
import { createOrJoinLobby, getLobby, getLobbyIds } from "../lobbies.js";
import { userId, lobbyId } from "../../__tests__/ids.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

const sampleLobby: ScriptedLobby = {
  id: 5000n,
  metadata: { mode: `ranked` },
  members: [
    {
      id: 11n,
      connected: true,
      canLinkLobby: true,
      metadata: { team: `blue` },
      user: {
        id: 11n,
        username: `ada`,
        displayName: `Ada`,
        status: 0,
        provisional: false
      }
    },
    {
      id: 22n,
      connected: false,
      canLinkLobby: false,
      metadata: {},
      user: {
        id: 22n,
        username: `grace`,
        displayName: `Grace`,
        status: 1,
        provisional: false
      }
    }
  ],
  linkedChannel: { id: 900n, name: `general`, guildId: 800n }
};

describe(`lobby entry ops (mock backend)`, () => {
  it(`createOrJoinLobby resolves with a live Lobby wrapping the joined id`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptLobby(state, sampleLobby);

    const lobby = await createOrJoinLobby(`secret-abc`, { client });

    // Why: create/join yields a lobbyId via callback; the op must then fetch the
    // handle and wrap it — returning a Lobby, not the raw id.
    expect(lobby.id).toBe(`5000`);
    expect(lobbyActionsOf(state)).toContain(`Discord_Client_CreateOrJoinLobby`);
  });

  it(`createOrJoinLobby with metadata uses the WithMetadata C function`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptLobby(state, sampleLobby);

    await createOrJoinLobby(`secret-abc`, {
      client,
      metadata: { mode: `ranked` },
      memberMetadata: { team: `blue` }
    });

    // Why: passing metadata must route to the distinct WithMetadata entry point
    // (which marshals two Discord_Properties), not the plain one.
    expect(lobbyActionsOf(state)).toContain(
      `Discord_Client_CreateOrJoinLobbyWithMetadata`
    );
  });

  it(`lobby getters re-read live SDK state (members, metadata, linkedChannel)`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptLobby(state, sampleLobby);
    const lobby = await createOrJoinLobby(`s`, { client });

    // Why: a lobby is a LIVE wrapper — getters read the SDK on each access and
    // return plain snapshots of the read-only sub-objects (members embed users,
    // metadata is a plain map, linkedChannel is optional).
    expect(lobby.memberIds).toEqual([`11`, `22`]);
    expect(lobby.metadata).toEqual({ mode: `ranked` });
    expect(lobby.members.map((m) => m.user?.username)).toEqual([
      `ada`,
      `grace`
    ]);
    expect(lobby.members[0]?.connected).toBe(true);
    expect(lobby.members[0]?.metadata).toEqual({ team: `blue` });
    expect(lobby.linkedChannel).toEqual({
      id: `900`,
      name: `general`,
      guildId: `800`
    });
    expect(lobby.member(userId(22n))?.connected).toBe(false);
    expect(lobby.member(userId(999n))).toBeUndefined();
  });

  it(`lobby.linkedChannel is undefined when the lobby isn't linked`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptLobby(state, { ...sampleLobby, id: 7000n, linkedChannel: undefined });
    const lobby = await createOrJoinLobby(`s`, { client });
    // Why: LinkedChannel is a bool-gated optional — an unlinked lobby must yield
    // undefined, not a zeroed-out channel snapshot.
    expect(lobby.linkedChannel).toBeUndefined();
  });

  it(`getLobby returns undefined when the user is not a member`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptLobby(state, sampleLobby);
    // Why: GetLobbyHandle is bool-gated; a non-member must yield undefined, not a
    // wrapper around an invalid handle.
    expect(getLobby(lobbyId(5000n), { client })?.id).toBe(`5000`);
    expect(getLobby(lobbyId(404n), { client })).toBeUndefined();
  });

  it(`getLobbyIds lists every joined lobby`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptLobby(state, sampleLobby);
    scriptLobby(state, { ...sampleLobby, id: 6000n });
    // Why: the scalar-id span primitive (readUInt64Span) must decode raw uint64s,
    // not handle pointers.
    expect(getLobbyIds({ client })).toEqual([`5000`, `6000`]);
  });
});
