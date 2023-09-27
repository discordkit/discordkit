import { z } from "zod";
import { put, type Fetcher, toProcedure } from "../utils";

export const createReactionSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1),
  emoji: z.string().min(1)
});

/**
 * ### [Create Reaction](https://discord.com/developers/docs/resources/channel#create-reaction)
 *
 * **PUT** `/channels/:channel/messages/:message/reactions/:emoji/@me`
 *
 * Create a reaction for the message. This endpoint requires the `READ_MESSAGE_HISTORY` permission to be present on the current user. Additionally, if nobody else has reacted to the message using this emoji, this endpoint requires the `ADD_REACTIONS` permission to be present on the current user. Returns a 204 empty response on success. Fires a Message Reaction Add Gateway event. The `emoji` must be URL Encoded or the request will fail with `10014: Unknown Emoji`. To use custom emoji, you must encode it in the format `name:id` with the emoji name and emoji id.
 */
export const createReaction: Fetcher<typeof createReactionSchema> = async ({
  channel,
  message,
  emoji
}) => put(`/channels/${channel}/messages/${message}/reactions/${emoji}/@me`);

export const createReactionProcedure = toProcedure(
  `mutation`,
  createReaction,
  createReactionSchema
);
