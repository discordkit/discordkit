import {
  array,
  integer,
  maxValue,
  minValue,
  nullish,
  number,
  object,
  exactOptional,
  partial,
  pipe
} from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { userSchema, type User } from "../user/types/User.js";

export const getReactionsSchema = object({
  channel: snowflake,
  message: snowflake,
  emoji: snowflake,
  params: exactOptional(
    partial(
      object({
        /** Get users after this user ID */
        after: nullish(snowflake),
        /** Max number of users to return (1-100) Default: 25 */
        limit: nullish(
          pipe(number(), integer(), minValue(1), maxValue(100)),
          25
        )
      })
    )
  )
});

/**
 * ### [Get Reactions](https://discord.com/developers/docs/resources/channel#get-reactions)
 *
 * **GET** `/channels/:channel/messages/:message/reactions/:emoji`
 *
 * Get a list of users that reacted with this emoji. Returns an array of {@link User | user objects} on success. The `emoji` must be URL Encoded or the request will fail with `10014: Unknown Emoji`. To use custom emoji, you must encode it in the format `name:id` with the emoji name and emoji id.
 */
export const getReactions: Fetcher<typeof getReactionsSchema, User[]> = async ({
  channel,
  message,
  emoji,
  params
}) =>
  get(`/channels/${channel}/messages/${message}/reactions/${emoji}`, params);

export const getReactionsSafe = toValidated(
  getReactions,
  getReactionsSchema,
  array(userSchema)
);

export const getReactionsProcedure = toProcedure(
  `query`,
  getReactions,
  getReactionsSchema,
  array(userSchema)
);

export const getReactionsQuery = toQuery(getReactions);
