import type { Snowflake } from "@discordkit/native";

/**
 * Webview-facing snowflake + payload types for the bridge.
 *
 * `@discordkit/native` types snowflake ids as branded `bigint` (`UserId` =
 * `Snowflake<"user">`), but ids cross the kkrpc bridge as **strings** (Discord's
 * wire convention — 64-bit ids serialize as strings to avoid precision loss; see
 * ./bigint.ts). So the webview side sees snowflakes as branded *strings*, matching
 * `@discordkit/core`'s `snowflake = string` model.
 *
 * `WireSnowflake<Tag>` is the string counterpart of native's bigint
 * `Snowflake<Tag>`, and `Wire<T>` recursively rewrites any branded-bigint
 * snowflake in a payload type to its string form, leaving everything else intact —
 * so `Wire<Relationship>` is `Relationship` with its `userId` (and nested `user.id`)
 * as strings, with the brand preserved (a `WireUserId` still can't be passed where
 * a `WireChannelId` is expected).
 */

declare const wireBrand: unique symbol;

/** The string form of a branded snowflake id as seen by the webview. */
export type WireSnowflake<Tag extends string> = string & {
  readonly [wireBrand]: Tag;
};

/** Recursively rewrite branded-bigint snowflakes in `T` to their string form. */
export type Wire<T> =
  T extends Snowflake<infer Tag>
    ? WireSnowflake<Tag>
    : T extends bigint
      ? string
      : T extends ReadonlyArray<infer U>
        ? Array<Wire<U>>
        : T extends object
          ? { [K in keyof T]: Wire<T[K]> }
          : T;

// Webview id aliases — the string counterparts of native's bigint id types.
export type WireUserId = WireSnowflake<`user`>;
export type WireLobbyId = WireSnowflake<`lobby`>;
export type WireChannelId = WireSnowflake<`channel`>;
export type WireMessageId = WireSnowflake<`message`>;
export type WireGuildId = WireSnowflake<`guild`>;
