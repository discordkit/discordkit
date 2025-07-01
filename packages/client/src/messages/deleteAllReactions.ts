import * as v from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteAllReactionsSchema = v.object({
  channel: snowflake,
  message: snowflake
});

/**
 * ### [Delete All Reactions](https://discord.com/developers/docs/resources/channel#delete-all-reactions)
 *
 * **DELETE** `/channels/:channel/messages/:message/reactions`
 *
 * Deletes all reactions on a message. This endpoint requires the `MANAGE_MESSAGES` permission to be present on the current user. Fires a Message Reaction Remove All Gateway event.
 */
export const deleteAllReactions: Fetcher<
  typeof deleteAllReactionsSchema
> = async ({ channel, message }) =>
  remove(`/channels/${channel}/messages/${message}/reactions`);

export const deleteAllReactionsSafe = toValidated(
  deleteAllReactions,
  deleteAllReactionsSchema
);

export const deleteAllReactionsProcedure = toProcedure(
  `mutation`,
  deleteAllReactions,
  deleteAllReactionsSchema
);
