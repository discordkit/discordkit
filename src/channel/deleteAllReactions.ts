import { z } from "zod";
import { remove, type Fetcher } from "../utils";

export const deleteAllReactionsSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1)
});

/**
 * Deletes all reactions on a message. This endpoint requires the `MANAGE_MESSAGES` permission to be present on the current user. Fires a [Message Reaction Remove All](https://discord.com/developers/docs/topics/gateway#message-reaction-remove-all) Gateway event.
 *
 * https://discord.com/developers/docs/resources/channel#delete-all-reactions
 */
export const deleteAllReactions: Fetcher<
  typeof deleteAllReactionsSchema
> = async ({ channel, message }) =>
  remove(`/channels/${channel}/messages/${message}/reactions`);
