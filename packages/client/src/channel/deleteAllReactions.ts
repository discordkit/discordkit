import { z } from "zod";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated
} from "@discordkit/core";

export const deleteAllReactionsSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1)
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
