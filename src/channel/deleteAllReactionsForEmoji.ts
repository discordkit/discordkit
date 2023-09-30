import { z } from "zod";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated
} from "#/utils/index.ts";

export const deleteAllReactionsForEmojiSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1),
  emoji: z.string().min(1)
});

/**
 * ### [Delete All Reactions for Emoji](https://discord.com/developers/docs/resources/channel#delete-all-reactions-for-emoji)
 *
 * **DELETE** `/channels/:channel/messages/:message/reactions/:emoji`
 *
 * Deletes all the reactions for a given emoji on a message. This endpoint requires the `MANAGE_MESSAGES` permission to be present on the current user. Fires a Message Reaction Remove Emoji Gateway event. The `emoji` must be URL Encoded or the request will fail with `10014: Unknown Emoji`. To use custom emoji, you must encode it in the format `name:id` with the emoji name and emoji id.
 */
export const deleteAllReactionsForEmoji: Fetcher<
  typeof deleteAllReactionsForEmojiSchema
> = async ({ channel, message, emoji }) =>
  remove(`/channels/${channel}/messages/${message}/reactions/${emoji}`);

export const deleteAllReactionsForEmojiSafe = toValidated(
  deleteAllReactionsForEmoji,
  deleteAllReactionsForEmojiSchema
);

export const deleteAllReactionsForEmojiProcedure = toProcedure(
  `mutation`,
  deleteAllReactionsForEmoji,
  deleteAllReactionsForEmojiSchema
);
