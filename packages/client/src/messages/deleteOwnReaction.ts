import * as v from "valibot";
import { remove, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const deleteOwnReactionSchema = v.object({
  channel: snowflake,
  message: snowflake,
  emoji: snowflake
});

/**
 * ### [Delete Own Reaction](https://discord.com/developers/docs/resources/message#delete-own-reaction)
 *
 * **DELETE** `/channels/:channel/messages/:message/reactions/:emoji/@me`
 *
 * Delete a reaction the current user has made for the message. Returns a 204 empty response on success. Fires a Message Reaction Remove Gateway event. The `emoji` must be [URL Encoded](https://en.wikipedia.org/wiki/Percent-encoding) or the request will fail with `10014: Unknown Emoji`. To use custom emoji, you must encode it in the format `name:id` with the emoji name and emoji id.
 */
export const deleteOwnReaction: Fetcher<
  typeof deleteOwnReactionSchema
> = async ({ channel, message, emoji }) =>
  remove(`/channels/${channel}/messages/${message}/reactions/${emoji}/@me`);
