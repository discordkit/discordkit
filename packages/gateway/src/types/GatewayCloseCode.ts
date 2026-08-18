// https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes

import * as v from "valibot";

/**
 * ### [Gateway Close Event Codes](https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes)
 */
export enum GatewayCloseCode {
  /** We're not sure what went wrong. Try reconnecting? */
  UNKNOWN_ERROR = 4000,
  /** You sent an invalid Gateway opcode or an invalid payload for an opcode. Don't do that! */
  UNKNOWN_OPCODE = 4001,
  /** You sent an invalid payload to Discord. Don't do that! */
  DECODE_ERROR = 4002,
  /** You sent us a payload prior to identifying, or this session has been invalidated. */
  NOT_AUTHENTICATED = 4003,
  /** The account token sent with your identify payload is incorrect. */
  AUTHENTICATION_FAILED = 4004,
  /** You sent more than one identify payload. Don't do that! */
  ALREADY_AUTHENTICATED = 4005,
  /** The sequence sent when resuming the session was invalid. Reconnect and start a new session. */
  INVALID_SEQ = 4007,
  /** Woah nelly! You're sending payloads to us too quickly. Slow it down! You will be disconnected on receiving this. */
  RATE_LIMITED = 4008,
  /** Your session timed out. Reconnect and start a new one. */
  SESSION_TIMED_OUT = 4009,
  /** You sent us an invalid shard when identifying. */
  INVALID_SHARD = 4010,
  /** The session would have handled too many guilds - you are required to shard your connection in order to connect. */
  SHARDING_REQUIRED = 4011,
  /** You sent an invalid version for the gateway. */
  INVALID_API_VERSION = 4012,
  /** You sent an invalid intent for a Gateway Intent. You may have incorrectly calculated the bitwise value. */
  INVALID_INTENTS = 4013,
  /** You sent a disallowed intent for a Gateway Intent. You may have tried to specify an intent that you have not enabled or are not approved for. */
  DISALLOWED_INTENTS = 4014
}

export const gatewayCloseCodeSchema = v.enum_(GatewayCloseCode);

/**
 * Close codes Discord says are safe to reconnect after, per the `Reconnect`
 * column of the docs table.
 */
const RECONNECTABLE: ReadonlySet<number> = new Set([
  GatewayCloseCode.UNKNOWN_ERROR,
  GatewayCloseCode.UNKNOWN_OPCODE,
  GatewayCloseCode.DECODE_ERROR,
  GatewayCloseCode.NOT_AUTHENTICATED,
  GatewayCloseCode.ALREADY_AUTHENTICATED,
  GatewayCloseCode.INVALID_SEQ,
  GatewayCloseCode.RATE_LIMITED,
  GatewayCloseCode.SESSION_TIMED_OUT
]);

/**
 * Whether a reconnect should be attempted after `code`.
 *
 * Unknown codes return `true`: an unrecognized close is far more likely to be
 * transport noise (proxy hiccup, 1006) than a fatal protocol error, and the
 * documented fatal codes are all enumerated above. Codes Discord marks as
 * non-reconnectable — bad token, invalid shard, invalid or disallowed intents —
 * return `false`, because retrying them is an infinite loop against Discord
 * that burns the session start limit.
 */
export const isReconnectable = (code: number): boolean =>
  !(code in GatewayCloseCode) || RECONNECTABLE.has(code);
