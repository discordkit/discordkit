import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "#/utils/index.ts";

export const deleteOwnReactionSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1),
  emoji: z.string().min(1)
});

/**
 * ### [Delete Own Reaction](https://discord.com/developers/docs/resources/channel#delete-own-reaction)
 *
 * **DELETE** `/channels/:channel/messages/:message/reactions/:emoji/@me`
 *
 * Delete a reaction the current user has made for the message. Returns a 204 empty response on success. Fires a Message Reaction Remove Gateway event. The `emoji` must be URL Encoded or the request will fail with `10014: Unknown Emoji`. To use custom emoji, you must encode it in the format `name:id` with the emoji name and emoji id.
 */
export const deleteOwnReaction: Fetcher<
  typeof deleteOwnReactionSchema
> = async ({ channel, message, emoji }) =>
  remove(`/channels/${channel}/messages/${message}/reactions/${emoji}/@me`);

export const deleteOwnReactionProcedure = toProcedure(
  `mutation`,
  deleteOwnReaction,
  deleteOwnReactionSchema
);
