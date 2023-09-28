import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import { userSchema, type User } from "#/user/types/User.ts";

export const getReactionsSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1),
  emoji: z.string().min(1),
  params: z
    .object({
      /** Get users after this user ID */
      after: z.string().min(1).nullable(),
      /** Max number of users to return (1-100) Default: 25 */
      limit: z.number().int().min(1).max(100).nullable().default(25)
    })
    .partial()
    .optional()
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

export const getReactionsProcedure = toProcedure(
  `query`,
  getReactions,
  getReactionsSchema,
  userSchema.array()
);

export const getReactionsQuery = toQuery(getReactions);
