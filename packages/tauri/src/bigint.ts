/**
 * Snowflake serialization for the kkrpc bridge.
 *
 * kkrpc's stdio transport serializes messages with plain `JSON.stringify`, which
 * THROWS on `bigint`. `@discordkit/native` returns branded snowflake ids as
 * `bigint` (`UserId`, `LobbyId`, …) throughout its payloads (e.g. every
 * `Relationship.userId`), so without conversion any call returning a snowflake
 * fails to serialize on the sidecar and the webview gets nothing.
 *
 * We follow Discord's own wire convention: **snowflakes cross as strings** (the
 * HTTP API returns 64-bit ids as strings to avoid integer-precision loss; the
 * same applies to our IPC). So `serialize` deep-replaces every outbound `bigint`
 * with its decimal string before kkrpc serializes. The webview thus receives
 * snowflakes as strings (matching `@discordkit/core`'s `snowflake = string`
 * model); the reverse direction (string id args → native's `bigint`) is handled
 * per-channel by the sidecar registrars via `snowflake()`, which know which args
 * are ids. Electron doesn't need this — its IPC uses structured clone, which
 * carries BigInt natively.
 */

/** Deep-replace every `bigint` with its decimal string (Discord's wire format). */
export const serialize = <T>(value: T): unknown => {
  if (typeof value === `bigint`) return value.toString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value !== null && typeof value === `object`) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = serialize(v);
    return out;
  }
  return value;
};

/** Deep-serialize an outbound argument/payload list. */
export const serializeArgs = (args: unknown[]): unknown[] =>
  args.map(serialize);
