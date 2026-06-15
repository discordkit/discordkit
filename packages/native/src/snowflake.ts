/**
 * Branded Discord **snowflake** id types.
 *
 * Every id in the SDK is a `uint64` snowflake, but a raw `bigint` says nothing
 * about *which kind* of id it is — nothing stops you passing a channel id where a
 * user id is expected. These nominal brands make the compiler enforce that an id
 * produced by one operation only flows into another that wants the same kind,
 * while remaining a plain `bigint` at runtime (the brand is a phantom field, so
 * there is zero runtime cost and ids cross FFI/IPC/JSON exactly as before).
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

/** A `uint64` Discord id of a specific kind `Tag` — a `bigint` at runtime. */
export type Snowflake<Tag extends string> = bigint & {
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
 * Brand a raw `bigint`/`string`/`number` as a specific snowflake id. Use only
 * for ids you supply yourself (a literal, a value from config/input) — ids
 * returned by the SDK are already branded. The type argument names the kind:
 *
 * ```ts
 * snowflake<UserId>("123456789012345678")
 * snowflake<LobbyId>(5000n)
 * ```
 *
 * Snowflakes exceed 2^53, so prefer a `bigint` or `string` over a `number`.
 */
export const snowflake = <T extends Snowflake<string>>(
  value: bigint | string | number
): T => BigInt(value) as T;
