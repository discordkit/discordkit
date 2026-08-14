// https://discord.com/developers/docs/events/gateway-events#payload-structure

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { GatewayOpcode } from "./GatewayOpcode.js";

const _gatewayPayloadSchema = v.object({
  /** {@link GatewayOpcode | Opcode} for the payload */
  op: v.enum_(GatewayOpcode),
  /** Event data */
  d: v.unknown(),
  /** Sequence number of event used for {@link resume | resuming} sessions and heartbeating. Present only on {@link GatewayOpcode.DISPATCH | Dispatch} payloads. */
  s: v.nullish(v.number()),
  /** The event name for this payload. Present only on {@link GatewayOpcode.DISPATCH | Dispatch} payloads. */
  t: v.nullish(v.string())
});

export interface GatewayPayload extends v.InferOutput<
  typeof _gatewayPayloadSchema
> {}

/**
 * ### [Payload Structure](https://discord.com/developers/docs/events/gateway-events#payload-structure)
 *
 * Every event sent over a Gateway connection — in either direction — is wrapped
 * in this envelope.
 *
 * `d` is deliberately `unknown`: its shape depends entirely on `op` (and on `t`
 * for dispatches), so narrowing belongs at the point where the opcode is known,
 * not here. Validating it eagerly against a union would mean parsing every
 * event's payload on every message, which is exactly the per-event cost this
 * package exists to avoid.
 */
export const gatewayPayloadSchema = schema<GatewayPayload>(
  _gatewayPayloadSchema
);
