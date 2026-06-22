import { describe, it, expect } from "vitest";
import { snowflake, subscribe } from "@discordkit/native";
import type { LobbyId } from "@discordkit/native";
import { fakeIo } from "./fakeIo.js";
import { createCoreBridge } from "../client.js";
import { voiceSlice } from "../client/voice.js";
import { lobbiesSlice } from "../client/lobbies.js";
import { statusSignal } from "../signals/statusSignal.js";
import { devicesSignal } from "../signals/devicesSignal.js";
import { logSignal } from "../signals/logSignal.js";
import { lobbyIdsSignal, lobbySignal } from "../signals/lobbySignals.js";
import { isConnectedSignal } from "../signals/derived.js";
import { asyncSignal } from "../signals/asyncSignal.js";
import { CORE_CHANNELS } from "../channels/core.js";
import { VOICE_CHANNELS } from "../channels/voice.js";
import { LOBBY_CHANNELS } from "../channels/lobbies.js";

/**
 * The signals are framework-agnostic reactive wrappers over the bridge's push
 * (events) + pull (getters). They must: seed from the getter, update on the
 * event, and expose the current value synchronously via `.get()`. We drive a real
 * bridge over a controllable fake transport and assert the signal's value — the
 * user-facing outcome. They're byte-for-byte the same logic as the Electron
 * adapter's signals (they take structural bridge slices); these tests confirm the
 * port behaves identically over the kkrpc seam.
 *
 * Seeding is async (a bridge round-trip), and signal subscribers fire on a
 * microtask (per native's `subscribe`), so assertions flush a turn before checking.
 */
/** Drain pending tasks (the seed chains several awaits via the fake transport). */
const flush = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

describe(`statusSignal`, () => {
  it(`seeds from getStatus then tracks onStatus events`, async () => {
    const t = fakeIo();
    const bridge = createCoreBridge(t.io);
    t.handle(CORE_CHANNELS.getStatus, () => `connecting`);

    const status = statusSignal(bridge);
    // Before the seed resolves it holds the safe default.
    expect(status.get()).toBe(`disconnected`);

    await flush(); // let the getStatus() seed land
    expect(status.get()).toBe(`connecting`);

    t.emit(CORE_CHANNELS.status, `ready`); // a live status event
    expect(status.get()).toBe(`ready`);
  });

  it(`notifies subscribers on change (the framework-glue path)`, async () => {
    const t = fakeIo();
    const bridge = createCoreBridge(t.io);
    t.handle(CORE_CHANNELS.getStatus, () => `disconnected`);
    const status = statusSignal(bridge);

    const seen: string[] = [];
    using _off = subscribe(status, (s) => seen.push(s));

    t.emit(CORE_CHANNELS.status, `ready`);
    await flush(); // subscribe() fires handlers on a microtask

    // Why: this is how React/Vue/Svelte adapters learn of changes — a missed
    // notification means the UI silently goes stale.
    expect(seen).toContain(`ready`);
  });
});

describe(`devicesSignal`, () => {
  it(`seeds from the device getters then tracks onDeviceChange`, async () => {
    const t = fakeIo();
    const { voice } = voiceSlice(t.io);
    t.handle(VOICE_CHANNELS.getInputDevices, () => [
      { id: `mic-1`, name: `Mic`, isDefault: true }
    ]);
    t.handle(VOICE_CHANNELS.getOutputDevices, () => [
      { id: `spk-1`, name: `Speakers`, isDefault: true }
    ]);

    const devices = devicesSignal(voice);
    expect(devices.get()).toEqual({ input: [], output: [] }); // default

    await flush(); // seeds resolve
    expect(devices.get().input.map((d) => d.id)).toEqual([`mic-1`]);
    expect(devices.get().output.map((d) => d.id)).toEqual([`spk-1`]);

    // A headset is plugged in → onDeviceChange replaces the lists.
    t.emit(VOICE_CHANNELS.deviceChange, {
      input: [{ id: `mic-2`, name: `Headset`, isDefault: false }],
      output: []
    });
    expect(devices.get().input.map((d) => d.id)).toEqual([`mic-2`]);
  });
});

describe(`logSignal`, () => {
  it(`accumulates log entries and caps the buffer at the limit`, () => {
    const t = fakeIo();
    const bridge = createCoreBridge(t.io);
    const logs = logSignal(bridge, { limit: 2 });

    t.emit(CORE_CHANNELS.log, { message: `a`, severity: `info` });
    t.emit(CORE_CHANNELS.log, { message: `b`, severity: `info` });
    t.emit(CORE_CHANNELS.log, { message: `c`, severity: `info` });

    // Why: a log panel needs the recent stream, but unbounded growth leaks memory
    // — the rolling buffer keeps only the last `limit`, oldest dropped.
    expect(logs.get().map((e) => e.message)).toEqual([`b`, `c`]);
  });
});

describe(`isConnectedSignal`, () => {
  it(`derives readiness from the status signal`, async () => {
    const t = fakeIo();
    const bridge = createCoreBridge(t.io);
    t.handle(CORE_CHANNELS.getStatus, () => `connecting`);
    const status = statusSignal(bridge);
    const connected = isConnectedSignal(status);

    await flush();
    // Why: the common "is Discord usable?" gate must track status without callers
    // re-checking the string — false until ready, true at ready.
    expect(connected.get()).toBe(false);
    t.emit(CORE_CHANNELS.status, `ready`);
    expect(connected.get()).toBe(true);
  });
});

describe(`lobbyIdsSignal`, () => {
  it(`seeds the joined set then tracks created/deleted`, async () => {
    const t = fakeIo();
    const { lobbies } = lobbiesSlice(t.io);
    t.handle(LOBBY_CHANNELS.getIds, () => [snowflake<LobbyId>(5000n)]);
    const ids = lobbyIdsSignal(lobbies);

    await flush();
    expect(ids.get()).toEqual([`5000`]);

    t.emit(LOBBY_CHANNELS.created, snowflake<LobbyId>(6000n));
    t.emit(LOBBY_CHANNELS.deleted, snowflake<LobbyId>(5000n));
    // Why: the lobby-list UI must stay in sync as the user joins/leaves — without
    // the event wiring it would show a stale set.
    expect(ids.get()).toEqual([`6000`]);
  });
});

describe(`lobbySignal`, () => {
  it(`seeds one lobby then re-fetches on a scoped event`, async () => {
    const t = fakeIo();
    const { lobbies } = lobbiesSlice(t.io);
    let members: string[] = [`11`];
    t.handle(LOBBY_CHANNELS.get, (id) => ({
      id,
      memberIds: members,
      members: [],
      metadata: {}
    }));
    const lobby = lobbySignal(lobbies, snowflake<LobbyId>(5000n));

    await flush();
    expect(lobby.get()?.memberIds).toEqual([`11`]);

    // A member joins THIS lobby → the snapshot is re-pulled (events carry only
    // ids, so the data must be re-fetched).
    members = [`11`, `22`];
    t.emit(LOBBY_CHANNELS.memberAdded, snowflake<LobbyId>(5000n), `22`);
    await flush();
    expect(lobby.get()?.memberIds).toEqual([`11`, `22`]);

    // An event for a DIFFERENT lobby must NOT trigger a re-fetch.
    members = [`99`];
    t.emit(LOBBY_CHANNELS.memberAdded, snowflake<LobbyId>(9999n), `99`);
    await flush();
    // Why: lobbySignal filters to its own id — an unrelated lobby's churn must not
    // clobber this one's snapshot.
    expect(lobby.get()?.memberIds).toEqual([`11`, `22`]);
  });
});

describe(`asyncSignal`, () => {
  it(`tracks loading → data and reloads on demand`, async () => {
    let count = 0;
    const read = async (): Promise<number> => Promise.resolve(++count);
    const resource = asyncSignal(read);

    // Starts loading, no data yet.
    expect(resource.get()).toMatchObject({ loading: true, data: undefined });
    await flush();
    expect(resource.get()).toMatchObject({ loading: false, data: 1 });

    // Why: pull-only reads have no event stream — reload() is how the UI refreshes
    // after a mutation; it must re-run and update data.
    await resource.reload();
    expect(resource.get().data).toBe(2);
  });

  it(`captures errors without losing the last good data`, async () => {
    let fail = false;
    const read = async (): Promise<string> =>
      fail ? Promise.reject(new Error(`boom`)) : Promise.resolve(`ok`);
    const resource = asyncSignal(read);
    await flush();
    expect(resource.get()).toMatchObject({ data: `ok`, error: undefined });

    fail = true;
    await resource.reload();
    // Why: a failed refresh should surface the error but keep the last good value
    // visible, not blank the UI.
    expect(resource.get().error).toBeInstanceOf(Error);
    expect(resource.get().data).toBe(`ok`);
  });

  it(`ignores a stale run's late result (newer reload wins)`, async () => {
    const deferreds: ((v: string) => void)[] = [];
    const read = async (): Promise<string> =>
      new Promise((resolve) => deferreds.push(resolve));
    const resource = asyncSignal(read); // run 1 (pending)
    void resource.reload(); // run 2 (pending)

    // Resolve run 2 first, then the stale run 1.
    deferreds[1]?.(`fresh`);
    await flush();
    deferreds[0]?.(`stale`);
    await flush();

    // Why: out-of-order replies are real; a superseded run must not overwrite the
    // latest result.
    expect(resource.get().data).toBe(`fresh`);
  });
});
