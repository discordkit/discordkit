import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { gatewayPayloadSchema } from "../GatewayPayload.js";
import { GatewayOpcode } from "../GatewayOpcode.js";

/**
 * The envelope every frame arrives in. `connection.ts` parses rather than
 * asserts it, so a schema that is too strict silently drops real frames —
 * which is how a required `d` once made `RECONNECT` unparseable, leaving the
 * client unable to act on Discord's own request to reconnect.
 */
describe(`gatewayPayloadSchema`, () => {
  it(`accepts a lifecycle frame that carries no d`, () => {
    // Discord documents `d` as `?mixed`. RECONNECT sends the opcode alone, so
    // requiring `d` rejects it and the reconnect never happens.
    expect(
      v.safeParse(gatewayPayloadSchema, { op: GatewayOpcode.RECONNECT }).success
    ).toBe(true);
  });

  it(`accepts the non-object payloads Discord really sends`, () => {
    // `d` is a boolean for INVALID_SESSION and a number for HEARTBEAT, so a
    // schema expecting an object would break both.
    for (const d of [false, 251, null]) {
      expect(
        v.safeParse(gatewayPayloadSchema, { op: GatewayOpcode.HEARTBEAT, d })
          .success
      ).toBe(true);
    }
  });

  it(`keeps s and t for dispatches`, () => {
    // `s` drives RESUME and `t` routes the fan-out; losing either breaks
    // resumption or delivery.
    const result = v.safeParse(gatewayPayloadSchema, {
      op: GatewayOpcode.DISPATCH,
      t: `MESSAGE_CREATE`,
      s: 42,
      d: {}
    });
    expect(result.success).toBe(true);
    expect(result.output).toMatchObject({ t: `MESSAGE_CREATE`, s: 42 });
  });

  it(`rejects an unknown opcode`, () => {
    // Every branch downstream switches on `op`, so an unrecognised one would
    // fall through the switch unnoticed. Better caught at the envelope.
    expect(v.safeParse(gatewayPayloadSchema, { op: 999 }).success).toBe(false);
  });

  it(`rejects a non-numeric sequence`, () => {
    // `s` is sent back in RESUME. A string here would corrupt the resume point
    // and silently replay or skip events.
    expect(
      v.safeParse(gatewayPayloadSchema, {
        op: GatewayOpcode.DISPATCH,
        s: `12`
      }).success
    ).toBe(false);
  });
});
