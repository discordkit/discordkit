import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { User } from "../user";

export const getReactionsSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1),
  emoji: z.string().min(1),
  params: z
    .object({
      /** Get users after this user ID */
      after: z.string().min(1),
      /** Max number of users to return (1-100) Default: 25 */
      limit: z.number().min(1).max(100)
    })
    .partial()
    .optional()
});

/**
 * Get a list of users that reacted with this emoji. Returns an array of user objects on success. The `emoji` must be [URL Encoded](https://en.wikipedia.org/wiki/Percent-encoding) or the request will fail with `10014: Unknown Emoji`. To use custom emoji, you must encode it in the format `name:id` with the emoji name and emoji id.
 *
 * https://discord.com/developers/docs/resources/channel#get-reactions
 */
export const getReactions: Fetcher<
  typeof getReactionsSchema,
  Array<Partial<User>>
> = async ({ channel, message, emoji, params }) =>
  get(`/channels/${channel}/messages/${message}/reactions/${emoji}`, params);
