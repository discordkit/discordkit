import { object } from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteUserReactionSchema = object({
  channel: snowflake,
  message: snowflake,
  emoji: snowflake,
  user: snowflake
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

export const deleteUserReactionSafe = toValidated(
  deleteUserReaction,
  deleteUserReactionSchema
);

export const deleteUserReactionProcedure = toProcedure(
  `mutation`,
  deleteUserReaction,
  deleteUserReactionSchema
);
