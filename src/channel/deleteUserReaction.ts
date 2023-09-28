import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "#/utils/index.ts";

export const deleteUserReactionSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1),
  emoji: z.string().min(1),
  user: z.string().min(1)
});

/**
 * ### [Delete User Reaction](https://discord.com/developers/docs/resources/channel#delete-user-reaction)
 *
 * **DELETE** `/channels/:channel/messages/:message/reactions/:emoji/:user`
 *
 * Deletes another user's reaction. This endpoint requires the `MANAGE_MESSAGES` permission to be present on the current user. Returns a 204 empty response on success. Fires a Message Reaction Remove Gateway event. The `emoji` must be URL Encoded or the request will fail with `10014: Unknown Emoji`. To use custom emoji, you must encode it in the format `name:id` with the emoji name and emoji id.
 */
export const deleteUserReaction: Fetcher<
  typeof deleteUserReactionSchema
> = async ({ channel, message, emoji, user }) =>
  remove(`/channels/${channel}/messages/${message}/reactions/${emoji}/${user}`);

export const deleteUserReactionProcedure = toProcedure(
  `mutation`,
  deleteUserReaction,
  deleteUserReactionSchema
);
