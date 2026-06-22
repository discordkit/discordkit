import { describe, it, expect, afterEach, vi } from "vitest";
import { setActivity } from "@discordkit/native/presence";
import { stubBackend, emitStatus } from "./stubBackend.js";
import { fakeConnection } from "./fakeConnection.js";
import { createClient } from "../client.js";
import { registerUsers } from "../sidecar/users.js";
import { usersSlice } from "../client/users.js";
import type { SidecarOptions } from "../sidecar.js";

// Mock presence so the sidecar's `setActivity` is observable — the test asserts
// the builder callback was normalized to a plain object before crossing the RPC
// boundary (functions can't be serialized). `clearActivity` stays a no-op spy.
vi.mock(`@discordkit/native/presence`, () => ({
  setActivity: vi.fn<(input: unknown) => Promise<void>>(async () => undefined),
  clearActivity: vi.fn<() => Promise<void>>(async () => undefined)
}));

/**
 * The Tauri bridge end to end: a real sidecar host (booted on a stub backend, no
 * real SDK) looped to a real webview client over the `SidecarConnection` seam —
 * the same seam the production kkrpc connection plugs into. So these round-trips
 * verify the bridge's actual job (handler wiring, argument passing, the
 * bidirectional event path), not a mock of it.
 *
 * The native status signal is delivered to subscribers on a microtask (per
 * native's `subscribe`), so event assertions flush one turn before checking.
 */

const bootOptions: SidecarOptions = {
  applicationId: 123n,
  backend: stubBackend as never
};

let dispose: (() => void) | undefined;

// A macrotask flush: the status signal seeds + re-arms its watcher across
// several microtask turns (native `subscribe`), and the fake connection chains
// awaits, so a single microtask isn't enough to settle the event path.
const flush = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

describe(`createClient`, () => {
  afterEach(() => {
    dispose?.();
    dispose = undefined;
  });

  describe(`core`, () => {
    it(`forwards a native status change to an onStatus subscriber`, async () => {
      const harness = fakeConnection([], bootOptions);
      dispose = harness.dispose;
      const discord = await createClient([], { connect: harness.connection });

      const seen: string[] = [];
      const off = discord.onStatus((s) => seen.push(s));

      emitStatus(3); // native "ready"
      await flush();
      off();

      // Why: forwarding the native signal across the RPC boundary to the webview is
      // the core's whole reason to exist — if this regresses the bridge is dead.
      expect(seen).toContain(`ready`);
    });

    it(`stops delivering events after unsubscribe`, async () => {
      const harness = fakeConnection([], bootOptions);
      dispose = harness.dispose;
      const discord = await createClient([], { connect: harness.connection });

      const seen: string[] = [];
      const off = discord.onStatus((s) => seen.push(s));
      off();

      emitStatus(3);
      await flush();

      // Why: a leaked listener after unsubscribe is a memory leak + double-render
      // bug in the renderer; the unsubscribe must actually detach.
      expect(seen).toHaveLength(0);
    });

    it(`getStatus reads the current value over the bridge`, async () => {
      const harness = fakeConnection([], bootOptions);
      dispose = harness.dispose;
      const discord = await createClient([], { connect: harness.connection });

      emitStatus(3);
      await flush();

      // Why: getStatus is the pull-side companion to onStatus push; the webview
      // needs a synchronous-ish current value on mount, not only future events.
      await expect(discord.getStatus()).resolves.toBe(`ready`);
    });

    it(`normalizes a setActivity builder callback to a plain object before send`, async () => {
      const harness = fakeConnection([], bootOptions);
      dispose = harness.dispose;
      const discord = await createClient([], { connect: harness.connection });

      await discord.setActivity((b) => {
        b.state = `In Match`;
      });

      // Why: if a function leaked across the boundary the real kkrpc transport would
      // throw; normalizing in the client is what keeps the builder ergonomics safe.
      // The object — never a function — must be what reaches the native op.
      expect(setActivity).toHaveBeenCalledWith(
        expect.objectContaining({ type: `playing`, state: `In Match` })
      );
    });
  });

  describe(`composition + errors`, () => {
    it(`exposes a composed domain namespace and round-trips its calls`, async () => {
      const harness = fakeConnection([registerUsers], bootOptions);
      dispose = harness.dispose;
      const discord = await createClient([usersSlice], {
        connect: harness.connection
      });

      // Why: per-domain composition is the package's core contract — a wired domain
      // must appear as its namespace AND its calls must reach the native op. (The
      // stub returns undefined for getCurrent; we assert the call resolves, proving
      // the channel is wired, not the SDK's data.)
      expect(discord.users).toBeDefined();
      await expect(discord.users.getCurrent()).resolves.toBeUndefined();
    });

    it(`throws a directed error when calling an un-wired domain`, async () => {
      // Core only — users NOT registered on the sidecar, but composed on the client.
      const harness = fakeConnection([], bootOptions);
      dispose = harness.dispose;
      const discord = await createClient([usersSlice], {
        connect: harness.connection
      });

      // Why: composing a client slice whose sidecar registrar was forgotten is the
      // most likely setup mistake; the error must name the fix (add the registrar),
      // not surface as an opaque "undefined is not a function".
      await expect(discord.users.getCurrent()).rejects.toThrow(
        /didn't register this domain/
      );
    });
  });
});
