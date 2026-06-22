/**
 * Branded Discord **snowflake** id types.
 *
 * Every id in the SDK is a `uint64` snowflake. We represent it as a decimal
 * **string** — the same model as `@discordkit/core`/the REST client (Discord's
 * own HTTP API returns 64-bit ids as strings to avoid precision loss), so ids are
 * interoperable across the whole library and cross any transport (FFI, IPC, JSON,
 * kkrpc) unchanged. The `uint64` ↔ string conversion is confined to native's FFI
 * boundary ({@link brandId}/{@link brandIds} on read, `BigInt(id)` on write); the
 * public type is always a string.
 *
 * A raw `string` says nothing about *which kind* of id it is — nothing stops you
 * passing a channel id where a user id is expected. These nominal brands make the
 * compiler enforce that an id produced by one operation only flows into another
 * that wants the same kind, while remaining a plain `string` at runtime (the brand
 * is a phantom field, so there is zero runtime cost).
 *
 * Ids you get back from the SDK are already branded (readers tag them at the one
 * point they're created), so they flow between operations with no casts:
 *
 * ```ts
 * for (const id of getLobbyIds()) getLobby(id); // id: LobbyId → getLobby(LobbyId)
 * ```
 *
 * To brand a raw value you supply yourself (a literal, a config string), use
 * {@link snowflake}:
 *
 * ```ts
 * const user = getUser(snowflake<UserId>("123456789012345678"));
 * ```
 */

/** Distinguishes one kind of snowflake id from another at the type level only. */
declare const brand: unique symbol;

/** A `uint64` Discord id of a specific kind `Tag` — a decimal `string` at runtime. */
export type Snowflake<Tag extends string> = string & {
  readonly [brand]: Tag;
};

/** A Discord user's id. */
export type UserId = Snowflake<`user`>;
/** A lobby's id. */
export type LobbyId = Snowflake<`lobby`>;
/** A channel's id (DM, lobby, or guild channel). */
export type ChannelId = Snowflake<`channel`>;
/** A message's id. */
export type MessageId = Snowflake<`message`>;
/** A guild (server)'s id. */
export type GuildId = Snowflake<`guild`>;
/** An application's id. */
export type ApplicationId = Snowflake<`application`>;

/**
 * Brand a raw `string`/`bigint`/`number` as a specific snowflake id. Use only
 * for ids you supply yourself (a literal, a value from config/input) — ids
 * returned by the SDK are already branded. The type argument names the kind:
 *
 * ```ts
 * snowflake<UserId>("123456789012345678")
 * snowflake<LobbyId>(5000n)
 * ```
 *
 * Snowflakes exceed 2^53, so prefer a `string` or `bigint` over a `number`.
 */
export const snowflake = <T extends Snowflake<string>>(
  value: bigint | string | number
): T => String(value) as T;

/**
 * Brand a `uint64` id read from the FFI as a snowflake `string`. This is native's
 * read-boundary: koffi returns `uint64_t` as a `bigint` (event callbacks may pass
 * a `number` for small values), which we normalize to its decimal string here so
 * every public id is a string. A `0n` id (the SDK's "no id" sentinel for an
 * invalid handle) becomes `"0"`.
 *
 * The value is typed `unknown` because the FFI binding getters return `unknown`
 * (the marshaling seam is untyped); this is the one place that untyped uint64 is
 * branded, so the cast lives here instead of at every call site.
 */
export const brandId = <T extends Snowflake<string>>(value: unknown): T =>
  String(value) as T;

/** Brand a span of `uint64` ids read from the FFI as snowflake `string`s. */
export const brandIds = <T extends Snowflake<string>>(values: bigint[]): T[] =>
  values.map((value) => String(value) as T);
