import { describe, it, expect } from "vitest";
import { snowflake } from "@discordkit/native";
import type { UserId } from "@discordkit/native";
import type { ActivityInvite } from "@discordkit/native/activity-invites";
import { createFakeIpc } from "./fakeIpc.js";
import { stubBackend } from "./stubBackend.js";
import { invitesSlice } from "../preload/invites.js";
import { bridgeIo } from "../internal.js";
import { registerDiscord, type DiscordMainHandle } from "../main.js";
import { registerInvites } from "../main/invites.js";
import { INVITE_CHANNELS } from "../channels/invites.js";

/**
 * The activity-invites slice maps RPC methods to channels and routes incoming
 * invite events to subscribers. We compose it against a fake ipcMain and assert
 * the user-facing outcome — the resolved value / delivered invite — never "an
 * invoke happened". A sample invite payload stands in for the native shape.
 */
const sampleInvite = { type: 1, partyId: `p1` } as unknown as ActivityInvite;

const setup = () => {
  const ipc = createFakeIpc();
  const io = bridgeIo(ipc.ipcRenderer);
  return { ipc, io };
};

describe(`invites slice`, () => {
  it(`send forwards userId + optional content`, async () => {
    const { ipc, io } = setup();
    const { invites } = invitesSlice(io);
    const calls: unknown[][] = [];
    ipc.ipcMain.handle(INVITE_CHANNELS.send, (_e, ...args) => {
      calls.push(args);
    });

    await invites.send(snowflake<UserId>(7n), `join me`);

    // Why: an invite must reach the right user with the right message — dropping
    // either arg invites the wrong person or strips the note.
    expect(calls).toEqual([[7n, `join me`]]);
  });

  it(`accept resolves with the join secret`, async () => {
    const { ipc, io } = setup();
    const { invites } = invitesSlice(io);
    ipc.ipcMain.handle(INVITE_CHANNELS.accept, () => `secret-xyz`);

    // Why: the join secret is the whole point of accepting — the game's party
    // system needs it, so it must round-trip back to the renderer.
    await expect(invites.accept(sampleInvite)).resolves.toBe(`secret-xyz`);
  });

  it(`onCreated delivers the emitted invite and unsubscribes`, () => {
    const { ipc, io } = setup();
    const { invites } = invitesSlice(io);
    const seen: ActivityInvite[] = [];
    const off = invites.onCreated((invite) => seen.push(invite));

    ipc.emit(INVITE_CHANNELS.created, sampleInvite);
    off();
    ipc.emit(INVITE_CHANNELS.created, sampleInvite);

    // Why: an incoming invite must reach the renderer whole, and the unsubscribe
    // must detach — otherwise the renderer either misses invites or leaks handlers.
    expect(seen).toEqual([sampleInvite]);
  });

  it(`onUpdated delivers the emitted invite`, () => {
    const { ipc, io } = setup();
    const { invites } = invitesSlice(io);
    const seen: ActivityInvite[] = [];
    invites.onUpdated((invite) => seen.push(invite));

    ipc.emit(INVITE_CHANNELS.updated, sampleInvite);

    // Why: invites can go invalid; the update event must reach the renderer so it
    // can stop showing a stale invite.
    expect(seen).toEqual([sampleInvite]);
  });
});

describe(`registerInvites`, () => {
  let handle: DiscordMainHandle | undefined;
  const boot = () => {
    const ipc = createFakeIpc();
    handle = registerDiscord(ipc.ipcMain, {
      applicationId: 123n,
      backend: stubBackend as never,
      targets: [ipc.target]
    });
    return { ipc, io: bridgeIo(ipc.ipcRenderer) };
  };

  it(`wires its RPC handlers + broadcasts invite events to renderers`, () => {
    const { ipc, io } = boot();
    expect(ipc.ipcMain.channels.has(INVITE_CHANNELS.send)).toBe(false);

    registerInvites(handle!.context);

    // Why: the registrar must wire the namespace's handlers AND its event fan-out;
    // without it an app can neither send invites nor learn about incoming ones.
    expect(ipc.ipcMain.channels.has(INVITE_CHANNELS.send)).toBe(true);
    expect(ipc.ipcMain.channels.has(INVITE_CHANNELS.accept)).toBe(true);
    const { invites } = invitesSlice(io);
    const seen: ActivityInvite[] = [];
    invites.onCreated((invite) => seen.push(invite));
    handle!.context.broadcast(INVITE_CHANNELS.created, sampleInvite);
    // Why: broadcast must reach a real renderer subscriber via target.send.
    expect(seen).toEqual([sampleInvite]);
    handle!.dispose();
    handle = undefined;
  });
});
