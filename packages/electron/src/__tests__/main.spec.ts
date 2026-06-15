import { describe, it, expect, afterEach } from "vitest";
import { createFakeIpc } from "./fakeIpc.js";
import { stubBackend, emitStatus } from "./stubBackend.js";
import { createCoreBridge } from "../preload.js";
import { usersSlice } from "../preload/users.js";
import { bridgeIo } from "../internal.js";
import { registerDiscord, type DiscordMainHandle } from "../main.js";
import { registerUsers } from "../main/users.js";
import { USER_CHANNELS } from "../channels/users.js";

/**
 * `registerDiscord` is the core main-process half: it boots the native client,
 * wires presence/auth/status/log, and hands back a context for per-domain
 * registrars. We boot it with a stub backend (no real SDK) + a fake IPC, and
 * drive it from the preload bridge for a true round-trip.
 *
 * The status signal is delivered to subscribers on a microtask (per native's
 * `subscribe`), so event assertions flush one turn before checking.
 */
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

const flush = async (): Promise<void> => Promise.resolve();

describe(`registerDiscord (core)`, () => {
  afterEach(() => {
    handle?.dispose();
    handle = undefined;
  });

  it(`a native status change reaches a renderer onStatus subscriber`, async () => {
    const { io } = boot();
    const core = createCoreBridge(io);
    const seen: string[] = [];
    const off = core.onStatus((s) => seen.push(s));

    emitStatus(3); // native "ready"
    await flush();
    off();

    // Why: forwarding the native signal to the renderer is the core's whole job —
    // this proves status callback → broadcast → target.send → ipcRenderer.on →
    // handler is intact (and maps code 3 → "ready").
    expect(seen).toEqual([`ready`]);
  });

  it(`getStatus returns the current native status through the bridge`, async () => {
    const { io } = boot();
    const core = createCoreBridge(io);
    emitStatus(3);
    await flush();
    // Why: a representative invoke round-trip end to end (read path).
    await expect(core.getStatus()).resolves.toBe(`ready`);
  });

  it(`stops broadcasting after dispose`, async () => {
    const { io } = boot();
    const core = createCoreBridge(io);
    const seen: string[] = [];
    core.onStatus((s) => seen.push(s));
    handle?.dispose();
    handle = undefined;
    emitStatus(3);
    await flush();
    // Why: dispose must unsubscribe the native streams.
    expect(seen).toEqual([]);
  });
});

describe(`per-domain registrar composition`, () => {
  afterEach(() => {
    handle?.dispose();
    handle = undefined;
  });

  it(`registerUsers wires its channels onto the same ipcMain via the context`, async () => {
    const { ipc, io } = boot();
    // Core alone registers no users handler — composing the domain adds it.
    expect(ipc.ipcMain.channels.has(USER_CHANNELS.getCurrent)).toBe(false);

    registerUsers(handle!.context);

    // Why: the per-domain registrar is how an app opts into a namespace; given the
    // context it must register that domain's handlers so the bridge can reach them.
    expect(ipc.ipcMain.channels.has(USER_CHANNELS.getCurrent)).toBe(true);
    const { users } = usersSlice(io);
    // getCurrentUser on the stub backend returns undefined (no scripted user) —
    // the point is the call routes through and resolves, not the value.
    await expect(users.getCurrent()).resolves.toBeUndefined();
  });
});
