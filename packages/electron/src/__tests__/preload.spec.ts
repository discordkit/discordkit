import { describe, it, expect, vi } from "vitest";
import { snowflake } from "@discordkit/native";
import type { UserId, ChannelId } from "@discordkit/native";
import { createFakeIpc } from "./fakeIpc.js";
import { createCoreBridge } from "../preload.js";
import { usersSlice } from "../preload/users.js";
import { lobbiesSlice } from "../preload/lobbies.js";
import { voiceSlice } from "../preload/voice.js";
import { bridgeIo } from "../internal.js";
import { CORE_CHANNELS } from "../channels/core.js";
import { USER_CHANNELS } from "../channels/users.js";
import { LOBBY_CHANNELS } from "../channels/lobbies.js";
import { VOICE_CHANNELS } from "../channels/voice.js";

/**
 * The preload bridge's contract is wiring: a domain slice maps each method to the
 * right channel + args and returns the reply, and `on*` routes a main→renderer
 * event to the subscriber. We compose the slices under test against a fake
 * ipcMain (stub handlers) and assert the user-facing outcome — the resolved value
 * / delivered event — never "an invoke happened".
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

describe(`core bridge`, () => {
  it(`connect/getStatus route to their channels and return the reply`, async () => {
    const { ipc, io } = setup();
    const core = createCoreBridge(io);
    ipc.ipcMain.handle(CORE_CHANNELS.getStatus, () => `ready`);

    // Why: the core surface must work on its own (no domain slices) — that's the
    // baseline every integration uses.
    await expect(core.getStatus()).resolves.toBe(`ready`);
  });

  it(`onStatus delivers broadcasts and unsubscribes`, () => {
    const { ipc, io } = setup();
    const core = createCoreBridge(io);
    const seen: string[] = [];
    const off = core.onStatus((s) => seen.push(s));

    ipc.emit(CORE_CHANNELS.status, `ready`);
    off();
    ipc.emit(CORE_CHANNELS.status, `disconnected`);

    // Why: the unsubscribe must actually detach, or the renderer leaks handlers.
    expect(seen).toEqual([`ready`]);
  });
});

describe(`domain slices`, () => {
  it(`usersSlice maps each method to its channel + returns the reply`, async () => {
    const { ipc, io } = setup();
    const { users } = usersSlice(io);
    const user = { id: 42n, username: `ada` };
    ipc.ipcMain.handle(USER_CHANNELS.getCurrent, () => user);
    ipc.ipcMain.handle(USER_CHANNELS.get, (_e, id) => ({ id }));

    await expect(users.getCurrent()).resolves.toEqual(user);
    // Why: `get` must forward the id arg — a dropped arg fetches the wrong user.
    await expect(users.get(snowflake<UserId>(7n))).resolves.toEqual({ id: 7n });
  });

  it(`id-keyed voice controls forward channelId + value in order`, async () => {
    const { io, echo } = setup();
    const { voice } = voiceSlice(io);
    const mute = echo(VOICE_CHANNELS.callSetSelfMute);
    const vol = echo(VOICE_CHANNELS.callSetParticipantVolume);

    await voice.setSelfMute(snowflake<ChannelId>(5000n), true);
    await voice.setParticipantVolume(
      snowflake<ChannelId>(5000n),
      snowflake<UserId>(11n),
      175
    );

    // Why: the live Call lives in main; the renderer addresses it by channelId —
    // a transposed arg targets the wrong call/participant.
    expect(mute).toEqual([[5000n, true]]);
    expect(vol).toEqual([[5000n, 11n, 175]]);
  });

  it(`bigint ids survive the round-trip intact`, async () => {
    const { ipc, io } = setup();
    const { lobbies } = lobbiesSlice(io);
    ipc.ipcMain.handle(LOBBY_CHANNELS.getIds, () => [5000n, 6000n]);

    const ids = await lobbies.getIds();
    // Why: ids are snowflakes (exceed 2^53) — they must stay bigint, not coerce.
    expect(ids).toEqual([5000n, 6000n]);
    expect(typeof ids[0]).toBe(`bigint`);
  });

  it(`multi-arg events (lobby member) deliver every id`, () => {
    const { ipc, io } = setup();
    const { lobbies } = lobbiesSlice(io);
    const seen: [bigint, bigint][] = [];
    const off = lobbies.onMemberAdded((l, m) => seen.push([l, m]));

    ipc.emit(LOBBY_CHANNELS.memberAdded, 5000n, 11n);
    off();
    expect(seen).toEqual([[5000n, 11n]]);
  });

  it(`snapshot-carrying events (device change) deliver the payload whole`, () => {
    const { ipc, io } = setup();
    const { voice } = voiceSlice(io);
    const devices = vi.fn<(payload: unknown) => void>();
    const off = voice.onDeviceChange(devices);
    const payload = { input: [{ id: `mic` }], output: [] };

    ipc.emit(VOICE_CHANNELS.deviceChange, payload);
    off();
    expect(devices).toHaveBeenCalledWith(payload);
  });
});

describe(`composition`, () => {
  it(`merging slices yields one bridge with every namespace`, () => {
    const { io } = setup();
    const bridge = Object.assign(
      createCoreBridge(io),
      usersSlice(io),
      lobbiesSlice(io),
      voiceSlice(io)
    );
    // Why: exposeDiscord merges slice objects onto the core — the composed bridge
    // must carry the core methods AND each requested namespace.
    expect(typeof bridge.connect).toBe(`function`);
    expect(typeof bridge.users.getCurrent).toBe(`function`);
    expect(typeof bridge.lobbies.createOrJoin).toBe(`function`);
    expect(typeof bridge.voice.startCall).toBe(`function`);
  });
});
