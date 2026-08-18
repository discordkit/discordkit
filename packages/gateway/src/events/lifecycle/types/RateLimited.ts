// https://discord.com/developers/docs/events/gateway-events#rate-limited

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";

/**
 * Metadata identifying which request was limited. Discord documents one shape
 * per opcode; today only opcode 8 (Request Guild Members) has one, so the
 * fields are optional rather than a discriminated union — a new opcode's
 * metadata shouldn't break parsing.
 */
const _rateLimitMetaSchema = v.object({
  /** Guild the limited request targeted */
  guildId: v.optional(snowflake),
  /** Nonce from the limited request */
  nonce: v.optional(v.string())
});

const _rateLimitedSchema = v.object({
  /** The opcode that was rate limited */
  opcode: v.number(),
  /** How long to wait, in seconds, before retrying */
  retryAfter: v.number(),
  /** Metadata identifying the limited request */
  meta: _rateLimitMetaSchema
});

export interface RateLimited extends v.InferOutput<typeof _rateLimitedSchema> {}

/**
 * ### [Rate Limited](https://discord.com/developers/docs/events/gateway-events#rate-limited)
 *
 * Sent when the app hits a per-event gateway rate limit — distinct from the
 * connection-wide 120-events-per-60-seconds limit, which closes the socket
 * instead. `retryAfter` is in **seconds**.
 */
export const rateLimitedSchema = schema<RateLimited>(_rateLimitedSchema);
