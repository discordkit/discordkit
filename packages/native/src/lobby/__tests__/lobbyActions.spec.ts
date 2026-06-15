import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import {
  scriptLobby,
  scriptGuilds,
  scriptChannels,
  lobbyActionsOf,
  type ScriptedLobby
} from "./mock.js";
import {
  createOrJoinLobby,
  getUserGuilds,
  getGuildChannels
} from "../lobbies.js";
import { channelId, guildId } from "../../__tests__/ids.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

const lobby: ScriptedLobby = {
  id: 5000n,
  metadata: {},
  members: [],
  linkedChannel: undefined
};

describe(`lobby actions + discovery (mock backend)`, () => {
  it(`leave/link/unlink resolve via their result callbacks`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptLobby(state, lobby);
    const l = await createOrJoinLobby(`s`, { client });

    await l.linkChannel(channelId(900n));
    await l.unlinkChannel();
    await l.leave();

    // Why: each action keys on the lobby's id and acks via awaitResult; this
    // proves the Lobby methods wire to the right C functions and resolve.
    expect(lobbyActionsOf(state)).toEqual(
      expect.arrayContaining([
        `Discord_Client_LinkChannelToLobby`,
        `Discord_Client_UnlinkChannelFromLobby`,
        `Discord_Client_LeaveLobby`
      ])
    );
  });

  it(`getUserGuilds resolves with Guild snapshots from the callback span`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptGuilds(state, [
      { id: 800n, name: `Saeris HQ` },
      { id: 801n, name: `Discordkit` }
    ]);

    const guilds = await getUserGuilds({ client });

    // Why: discovery ops resolve with a span read in the callback — the picker UI
    // needs the full list of servers the user belongs to.
    expect(guilds).toEqual([
      { id: 800n, name: `Saeris HQ` },
      { id: 801n, name: `Discordkit` }
    ]);
  });

  it(`getGuildChannels exposes linkability + linked-lobby info`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    scriptChannels(state, [
      {
        id: 900n,
        name: `general`,
        type: 0,
        position: 0,
        linkable: true,
        viewableByAll: true,
        parentId: 950n
      },
      {
        id: 901n,
        name: `admins`,
        type: 0,
        position: 1,
        linkable: false,
        viewableByAll: false,
        linkedLobby: { lobbyId: 5000n, applicationId: 123n }
      }
    ]);

    const channels = await getGuildChannels(guildId(800n), { client });

    // Why: the picker must surface linkable/viewableByAll (to warn about private
    // channels) and the already-linked lobby — the optional parentId/linkedLobby
    // out-params (uint64* and nested struct) must read correctly.
    expect(channels[0]).toMatchObject({
      id: 900n,
      type: `guildText`,
      linkable: true,
      viewableByAll: true,
      parentId: 950n
    });
    expect(channels[0]?.linkedLobby).toBeUndefined();
    expect(channels[1]).toMatchObject({
      linkable: false,
      viewableByAll: false,
      linkedLobby: { lobbyId: 5000n, applicationId: 123n }
    });
    expect(channels[1]?.parentId).toBeUndefined();
  });
});
