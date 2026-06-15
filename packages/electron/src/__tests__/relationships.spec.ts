import { describe, it, expect } from "vitest";
import { snowflake } from "@discordkit/native";
import type { UserId } from "@discordkit/native";
import { createFakeIpc } from "./fakeIpc.js";
import { stubBackend } from "./stubBackend.js";
import { relationshipsSlice } from "../preload/relationships.js";
import { bridgeIo } from "../internal.js";
import { registerDiscord, type DiscordMainHandle } from "../main.js";
import { registerRelationships } from "../main/relationships.js";
import { RELATIONSHIP_CHANNELS } from "../channels/relationships.js";

/**
 * The relationships slice is pure wiring: each method maps to one channel and
 * forwards its arg(s). We compose it against a fake ipcMain (echo handlers) and
 * assert the user-facing outcome — the resolved value / forwarded arg — never
 * "an invoke happened". The registrar test then proves an app can opt into the
 * namespace by wiring its handlers onto the same ipcMain.
 */
const setup = () => {
  const ipc = createFakeIpc();
  const io = bridgeIo(ipc.ipcRenderer);
  /** Register a main handler that echoes its args, so we can assert routing. */
  const echo = (channel: string): unknown[][] => {
    const calls: unknown[][] = [];
    ipc.ipcMain.handle(channel, (_e, ...args) => {
      calls.push(args);
      return args[0];
    });
    return calls;
  };
  return { ipc, io, echo };
};

describe(`relationships slice`, () => {
  it(`list reads with no args and returns the reply`, async () => {
    const { ipc, io } = setup();
    const { relationships } = relationshipsSlice(io);
    const all = [{ user: { id: 1n } }, { user: { id: 2n } }];
    ipc.ipcMain.handle(RELATIONSHIP_CHANNELS.list, () => all);

    // Why: `list` is the no-arg read — the whole roster must come back intact, or
    // the renderer can't render the friends list.
    await expect(relationships.list()).resolves.toEqual(all);
  });

  it(`get forwards the userId and returns that relationship`, async () => {
    const { ipc, io } = setup();
    const { relationships } = relationshipsSlice(io);
    ipc.ipcMain.handle(RELATIONSHIP_CHANNELS.get, (_e, id) => ({
      user: { id }
    }));

    // Why: `get` must forward the id — a dropped arg fetches the wrong person.
    await expect(relationships.get(snowflake<UserId>(7n))).resolves.toEqual({
      user: { id: 7n }
    });
  });

  it(`id actions and username actions route to their distinct channels`, async () => {
    const { io, echo } = setup();
    const { relationships } = relationshipsSlice(io);
    const block = echo(RELATIONSHIP_CHANNELS.block);
    const accept = echo(RELATIONSHIP_CHANNELS.acceptDiscord);
    const send = echo(RELATIONSHIP_CHANNELS.sendDiscord);

    await relationships.block(snowflake<UserId>(11n));
    await relationships.acceptDiscordRequest(snowflake<UserId>(22n));
    await relationships.sendDiscordRequest(`ada#0001`);

    // Why: these share the same arity but mean very different things — a
    // mis-routed channel would block someone instead of friending them, or send a
    // request to the wrong identifier shape (username vs id).
    expect(block).toEqual([[11n]]);
    expect(accept).toEqual([[22n]]);
    expect(send).toEqual([[`ada#0001`]]);
  });
});

describe(`registerRelationships`, () => {
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

  it(`wires its channels onto the context's ipcMain`, async () => {
    const { ipc, io } = boot();
    // Core alone registers no relationships handler — the domain adds it.
    expect(ipc.ipcMain.channels.has(RELATIONSHIP_CHANNELS.list)).toBe(false);

    registerRelationships(handle!.context);

    // Why: the per-domain registrar is how an app opts into a namespace; given the
    // context it must register that domain's handlers so the bridge can reach them.
    expect(ipc.ipcMain.channels.has(RELATIONSHIP_CHANNELS.list)).toBe(true);
    expect(ipc.ipcMain.channels.has(RELATIONSHIP_CHANNELS.get)).toBe(true);
    expect(ipc.ipcMain.channels.has(RELATIONSHIP_CHANNELS.block)).toBe(true);
    const { relationships } = relationshipsSlice(io);
    // The stub backend returns an empty roster — the point is the call routes
    // through and resolves, not the value.
    await expect(relationships.list()).resolves.toBeDefined();
    handle!.dispose();
    handle = undefined;
  });
});
