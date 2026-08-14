import { env } from "cloudflare:workers";
import { describe, it, expect } from "vitest";
import {
  EVENT_INTENTS,
  GatewayOpcode,
  PRIVILEGED_INTENTS
} from "@discordkit/gateway";
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
