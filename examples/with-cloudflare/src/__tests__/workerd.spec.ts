import { env } from "cloudflare:workers";
import { describe, it, expect } from "vitest";
import * as v from "valibot";
import {
  EVENT_INTENTS,
  GatewayOpcode,
  PRIVILEGED_INTENTS
} from "@discordkit/gateway";
import { clientMessageSchema } from "../shared/protocol.js";
import type { GatewayInspector } from "../worker/inspector.js";

/**
 * The runtime spike: does `@discordkit/gateway` run **unmodified on workerd**?
 *
 * This is the load-bearing claim behind targeting Workers/Durable Objects — the
 * package deliberately uses the Web-standard global `WebSocket` and keeps Node
 * builtins off the hot path. `nodejs_compat` is intentionally NOT enabled in
 * wrangler.jsonc.
 *
 * Note this proves the code RUNS; it does not prove it DEPLOYS. The pool's
 * module resolution is permissive (Vitest itself needs Node interop), so
 * `node:fs` and `node:net` resolve fine here — verified by injecting a
 * `node:buffer` import, which this suite happily ignored. `vp run check:bundle`
 * is the other half, and catches exactly that.
 */

// The pool types `env` from the ambient `Cloudflare.Env`, which wrangler
// generates from wrangler.jsonc's bindings. This example doesn't run
// `wrangler types`, so narrow it here rather than commit a generated file.
const inspectorEnv = env as unknown as {
  INSPECTOR: DurableObjectNamespace<GatewayInspector>;
};

const inspector = (name: string): DurableObjectStub<GatewayInspector> =>
  inspectorEnv.INSPECTOR.get(inspectorEnv.INSPECTOR.idFromName(name));

describe(`@discordkit/gateway on workerd`, () => {
  it(`instantiates a Durable Object that imports the package`, async () => {
    // Reaching a successful RPC response proves the whole module graph —
    // connection.ts, the codegen'd types, the event modules — evaluated inside
    // workerd. A Node builtin on the import path would have thrown during
    // module evaluation, before the class could be constructed.
    await expect(inspector(`import-probe`).status()).resolves.toMatchObject({
      state: `idle`,
      sessionId: null,
      eventCount: 0
    });
  });

  it(`starts with no intents until a viewer connects`, async () => {
    // The inspector's intents come from the UI rather than being fixed, so an
    // untouched instance should be requesting nothing at all.
    await expect(inspector(`intent-probe`).declaredIntents()).resolves.toEqual(
      []
    );
  });

  it(`carries the generated intent map into the Workers bundle`, () => {
    // EVENT_INTENTS drives the inspector's per-event attribution. Losing it to
    // a bundler would silently blank that UI rather than error.
    expect(EVENT_INTENTS.MESSAGE_CREATE).toEqual([
      `GUILD_MESSAGES`,
      `DIRECT_MESSAGES`
    ]);
    expect(PRIVILEGED_INTENTS).toContain(`MESSAGE_CONTENT`);
  });

  it(`exposes the Web-standard WebSocket the package relies on`, () => {
    // The package calls `new WebSocket(url)` with no injected transport, so
    // this global is the entire transport story on workerd.
    expect(typeof WebSocket).toBe(`function`);
  });

  it(`carries the codegen'd protocol constants into the Workers bundle`, () => {
    // Guards against a bundler dropping or mangling the enums — they are the
    // wire contract, so a wrong value is a silent protocol error.
    expect(GatewayOpcode.IDENTIFY).toBe(2);
    expect(GatewayOpcode.HELLO).toBe(10);
    expect(GatewayOpcode.HEARTBEAT_ACK).toBe(11);
  });
});

describe(`inbound message validation`, () => {
  it(`accepts every message the protocol defines`, async () => {
    // The schema is the type's source of truth, so a shape the UI sends must
    // parse — otherwise validation would break the app rather than protect it.
    for (const message of [
      { type: `connect`, token: `t`, intents: [`GUILDS`] },
      { type: `reconnect`, intents: [`GUILDS`] },
      { type: `disconnect` },
      { type: `record`, recording: false },
      { type: `recordFilter`, types: [`MESSAGE_CREATE`] },
      { type: `recordFilter`, types: null },
      { type: `simulate`, event: `MESSAGE_CREATE` },
      { type: `clear` }
    ] as const) {
      expect(v.safeParse(clientMessageSchema, message).success).toBe(true);
    }
  });

  it(`rejects a known type carrying the wrong payload`, () => {
    // The case a cast could not catch: `type` is valid, so the DO would have
    // dispatched on it and read `intents` as an array that isn't there.
    const result = v.safeParse(clientMessageSchema, {
      type: `connect`,
      token: 42,
      intents: `GUILDS`
    });
    expect(result.success).toBe(false);
    // And the issues name the offending fields, which is what makes the
    // error message actionable rather than "Malformed message".
    const paths = (result.issues ?? []).map((i) =>
      i.path?.map((p) => String(p.key)).join(`.`)
    );
    expect(paths).toContain(`token`);
  });

  it(`rejects an unknown message type`, () => {
    expect(
      v.safeParse(clientMessageSchema, { type: `drop-tables` }).success
    ).toBe(false);
  });
});

describe(`connection lifecycle`, () => {
  it(`can reconnect after a connection has closed`, async () => {
    // The wedge: a closed connection is still a non-null object, so a
    // presence-only guard made every later Connect a silent no-op. Once a
    // session failed — bad token, 4014, dropped socket — the inspector could
    // never reconnect without evicting the Durable Object.
    const probe = inspector(`reconnect-after-close`);

    await probe.applyMessage({
      type: `connect`,
      token: `fake-token`,
      intents: [`GUILDS`]
    });

    // Close the Gateway socket the way Discord does — WITHOUT going through
    // `disconnect`, which nulls the field and so hides the bug. This leaves
    // `#connection` set but spent, which is the real post-failure state.
    await probe.forceClose();
    await expect(probe.status()).resolves.toMatchObject({ state: `closed` });

    // Connecting again must build a new connection rather than returning early
    // because a (dead) one is still assigned.
    await probe.applyMessage({
      type: `connect`,
      token: `fake-token`,
      intents: [`GUILD_MESSAGES`]
    });

    const status = await probe.status();
    expect(status.state).not.toBe(`closed`);
    expect(status.intents).toEqual([`GUILD_MESSAGES`]);
  });

  it(`keeps the Gateway session when a viewer reconnects within the grace period`, async () => {
    // A page refresh closes the browser socket and reopens it a moment later.
    // Tearing the Gateway session down on the first close meant a refresh cost
    // a session start and dropped every incoming event — the reported bug.
    const probe = inspector(`refresh-grace`);
    await probe.applyMessage({
      type: `connect`,
      token: `fake-token`,
      intents: [`GUILDS`]
    });
    const before = await probe.status();
    expect(before.state).not.toBe(`idle`);

    // Simulate the refresh: last viewer leaves, a new one arrives immediately.
    await probe.simulateViewerClose();
    await probe.simulateViewerOpen();

    // Session intact, and its intents still reported so the UI can restore the
    // selection instead of snapping back to defaults.
    const after = await probe.status();
    expect(after.state).toBe(before.state);
    expect(after.intents).toEqual([`GUILDS`]);
  });

  it(`applies the new intents on reconnect`, async () => {
    // "Apply & reconnect" exists to change intents, which Discord only accepts
    // in IDENTIFY. If the reconnect silently kept the old set, the button
    // would appear to work while changing nothing.
    const probe = inspector(`reconnect-intents`);
    await probe.applyMessage({
      type: `connect`,
      token: `fake-token`,
      intents: [`GUILDS`]
    });
    await probe.applyMessage({
      type: `reconnect`,
      intents: [`GUILDS`, `GUILD_VOICE_STATES`]
    });

    await expect(probe.status()).resolves.toMatchObject({
      intents: [`GUILDS`, `GUILD_VOICE_STATES`]
    });
  });
});

describe(`recording`, () => {
  it(`stops buffering while paused`, async () => {
    const probe = inspector(`pause-probe`);
    await probe.simulateEvent(`MESSAGE_CREATE`);
    await expect(probe.status()).resolves.toMatchObject({ eventCount: 1 });

    await probe.applyMessage({ type: `record`, recording: false });
    await probe.simulateEvent(`MESSAGE_CREATE`);
    await probe.simulateEvent(`TYPING_START`);

    // The buffer must not grow while paused — that is the entire feature.
    await expect(probe.status()).resolves.toMatchObject({
      eventCount: 1,
      recording: false
    });
  });

  it(`keeps discovering event types while paused`, async () => {
    // Pausing must not hide which events are arriving, or you could never
    // learn a type exists in order to add it to the capture filter.
    const probe = inspector(`paused-types-probe`);
    await probe.applyMessage({ type: `record`, recording: false });
    await probe.simulateEvent(`GUILD_CREATE`);

    const status = await probe.status();
    expect(status.eventCount).toBe(0);
    expect(status.seenTypes).toContain(`GUILD_CREATE`);
  });

  it(`records only the allowlisted types`, async () => {
    const probe = inspector(`filter-probe`);
    await probe.applyMessage({
      type: `recordFilter`,
      types: [`MESSAGE_CREATE`]
    });

    await probe.simulateEvent(`MESSAGE_CREATE`);
    await probe.simulateEvent(`TYPING_START`);
    await probe.simulateEvent(`PRESENCE_UPDATE`);

    // Only the allowlisted type is buffered, but every type is still
    // discoverable — the filter decides what is KEPT, not what arrives.
    const status = await probe.status();
    expect(status.eventCount).toBe(1);
    expect(status.seenTypes).toEqual(
      expect.arrayContaining([
        `MESSAGE_CREATE`,
        `TYPING_START`,
        `PRESENCE_UPDATE`
      ])
    );
  });

  it(`records lifecycle markers even while paused or filtered`, async () => {
    // These mark where a session ended and the next began. Suppressing them
    // via a pause or a type allowlist would hide exactly the context needed to
    // read the surrounding gap — a reconnect would look like silence.
    const probe = inspector(`lifecycle-markers`);
    await probe.applyMessage({ type: `record`, recording: false });
    await probe.applyMessage({
      type: `recordFilter`,
      types: [`MESSAGE_CREATE`]
    });

    await probe.simulateLifecycle(`CLOSED`);

    const status = await probe.status();
    expect(status.eventCount).toBe(1);
    // And they stay out of the capture filter's list, which offers only the
    // dispatch types a bot can actually subscribe to.
    expect(status.seenTypes).not.toContain(`CLOSED`);
  });

  it(`resumes buffering when recording is turned back on`, async () => {
    // The pause must be reversible without reconnecting: the whole point is
    // that capture is a local decision, not a Gateway one.
    const probe = inspector(`resume-probe`);
    await probe.applyMessage({ type: `record`, recording: false });
    await probe.simulateEvent(`MESSAGE_CREATE`);
    await probe.applyMessage({ type: `record`, recording: true });
    await probe.simulateEvent(`MESSAGE_CREATE`);

    await expect(probe.status()).resolves.toMatchObject({
      eventCount: 1,
      recording: true
    });
  });
});
