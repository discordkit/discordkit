import { describe, it, expect, afterEach } from "vitest";
import { snowflake, type LobbyId } from "@discordkit/native";
import { stubBackend } from "./stubBackend.js";
import { fakeConnection } from "./fakeConnection.js";
import { createClient } from "../client.js";
import type { SidecarOptions } from "../sidecar.js";
import { registerUsers } from "../sidecar/users.js";
import { registerRelationships } from "../sidecar/relationships.js";
import { registerInvites } from "../sidecar/invites.js";
import { registerLobbies } from "../sidecar/lobbies.js";
import { registerMessaging } from "../sidecar/messaging.js";
import { registerVoice } from "../sidecar/voice.js";
import { usersSlice } from "../client/users.js";
import { relationshipsSlice } from "../client/relationships.js";
import { invitesSlice } from "../client/invites.js";
import { lobbiesSlice } from "../client/lobbies.js";
import { messagingSlice } from "../client/messaging.js";
import { voiceSlice } from "../client/voice.js";
import { LOBBY_CHANNELS } from "../channels/lobbies.js";

/**
 * Feature-domain coverage for the Tauri bridge. The per-domain client slices are
 * byte-identical to the Electron adapter's (already exhaustively tested there);
 * what's new in Tauri is the kkrpc transport seam, so these tests target that:
 * every domain composes onto the bridge and round-trips through the seam, and the
 * snapshot + id-keyed-RPC + event path works end to end (lobbies, the
 * representative snapshot/event domain).
 */

const bootOptions: SidecarOptions = {
  applicationId: 123n,
  backend: stubBackend as never
};

const flush = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

let dispose: (() => void) | undefined;

const teardown = (): void => {
  dispose?.();
  dispose = undefined;
};

describe(`feature domains`, () => {
  afterEach(teardown);

  it(`composes every domain namespace onto one bridge`, async () => {
    const harness = fakeConnection(
      [
        registerUsers,
        registerRelationships,
        registerInvites,
        registerLobbies,
        registerMessaging,
        registerVoice
      ],
      bootOptions
    );
    dispose = harness.dispose;

    const discord = await createClient(
      [
        usersSlice,
        relationshipsSlice,
        invitesSlice,
        lobbiesSlice,
        messagingSlice,
        voiceSlice
      ],
      { connect: harness.connection }
    );

    // Why: the package's whole value is opt-in per-domain composition — every
    // composed slice must surface as its namespace on the one bridge object, or
    // the app can't reach the feature it wired.
    expect(discord.users).toBeDefined();
    expect(discord.relationships).toBeDefined();
    expect(discord.invites).toBeDefined();
    expect(discord.lobbies).toBeDefined();
    expect(discord.messages).toBeDefined();
    expect(discord.voice).toBeDefined();
  });

  it(`round-trips a pull read through a composed domain (relationships.list)`, async () => {
    const harness = fakeConnection([registerRelationships], bootOptions);
    dispose = harness.dispose;
    const discord = await createClient([relationshipsSlice], {
      connect: harness.connection
    });

    // Why: proves the call reaches the native op and the reply crosses the seam
    // back (the stub yields an empty list — we assert the shape/round-trip, not
    // Discord's data).
    await expect(discord.relationships.list()).resolves.toEqual([]);
  });

  it(`getCalls round-trips an empty snapshot list`, async () => {
    const harness = fakeConnection([registerVoice], bootOptions);
    dispose = harness.dispose;
    const discord = await createClient([voiceSlice], {
      connect: harness.connection
    });

    // Why: snapshot reads must serialize across the bridge; an empty list is the
    // baseline (no active calls under the stub) that confirms the path is wired.
    await expect(discord.voice.getCalls()).resolves.toEqual([]);
  });
});

describe(`lobbies (snapshot + event path)`, () => {
  afterEach(teardown);

  it(`getIds round-trips the (empty) id list`, async () => {
    const harness = fakeConnection([registerLobbies], bootOptions);
    dispose = harness.dispose;
    const discord = await createClient([lobbiesSlice], {
      connect: harness.connection
    });

    await expect(discord.lobbies.getIds()).resolves.toEqual([]);
  });

  it(`delivers a lobby event (id payload) to an onCreated subscriber`, async () => {
    // Drive the event path directly via broadcast — the native stub doesn't fire
    // lobby events, but the bridge's job is to relay whatever the SDK broadcasts.
    const harness = fakeConnection([registerLobbies], bootOptions);
    dispose = harness.dispose;
    const discord = await createClient([lobbiesSlice], {
      connect: harness.connection
    });

    const seen: unknown[] = [];
    discord.lobbies.onCreated((id) => seen.push(id));

    // Push the event the way the SDK would (the stub doesn't fire lobby events).
    // The SDK side emits a bigint id; the bridge serializes it to a string for
    // the webview (Discord's wire format).
    harness.broadcast(LOBBY_CHANNELS.created, snowflake<LobbyId>(42n));
    await flush();

    // Why: lobby events carry only ids over the bridge (live handles can't cross);
    // the webview re-fetches the snapshot. This proves the id reaches the handler
    // as the wire string the webview expects.
    expect(seen).toEqual([`42`]);
  });
});
