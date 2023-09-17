import { z } from "zod";
import { mutation, remove } from "../utils";

export const deleteAllReactionsForEmojiSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1),
  emoji: z.string().min(1)
});

/**
 * Deletes all the reactions for a given emoji on a message. This endpoint requires the `MANAGE_MESSAGES` permission to be present on the current user. Fires a [Message Reaction Remove Emoji](https://discord.com/developers/docs/topics/gateway#message-reaction-remove-emoji) Gateway event. The `emoji` must be [URL Encoded](https://en.wikipedia.org/wiki/Percent-encoding) or the request will fail with `10014: Unknown Emoji`. To use custom emoji, you must encode it in the format `name:id` with the emoji name and emoji id.
 *
 * https://discord.com/developers/docs/resources/channel#delete-all-reactions-for-emoji
 */
export const deleteAllReactionsForEmoji = mutation(
  deleteAllReactionsForEmojiSchema,
  async ({ channel, message, emoji }) =>
    remove(`/channels/${channel}/messages/${message}/reactions/${emoji}`)
);
