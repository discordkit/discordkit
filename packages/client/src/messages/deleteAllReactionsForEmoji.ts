import * as v from "valibot";
import { remove, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const deleteAllReactionsForEmojiSchema = v.object({
  channel: snowflake,
  message: snowflake,
  emoji: snowflake
});

/**
 * ### [Delete All Reactions for Emoji](https://discord.com/developers/docs/resources/message#delete-all-reactions-for-emoji)
 *
 * **DELETE** `/channels/:channel/messages/:message/reactions/:emoji`
 *
 * Deletes all the reactions for a given emoji on a message. This endpoint requires the `MANAGE_MESSAGES` permission to be present on the current user. Fires a Message Reaction Remove Emoji Gateway event. The `emoji` must be [URL Encoded](https://en.wikipedia.org/wiki/Percent-encoding) or the request will fail with `10014: Unknown Emoji`. To use custom emoji, you must encode it in the format `name:id` with the emoji name and emoji id.
 */
export const deleteAllReactionsForEmoji: Fetcher<
  typeof deleteAllReactionsForEmojiSchema
> = async ({ channel, message, emoji }) =>
  remove(`/channels/${channel}/messages/${message}/reactions/${emoji}`);
