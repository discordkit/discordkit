import { z } from "zod";
import { mutation, remove } from "../utils";

export const deleteMessageSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1)
});

/**
 * Delete a message. If operating on a guild channel and trying to delete a message that was not sent by the current user, this endpoint requires the `MANAGE_MESSAGES` permission. Returns a 204 empty response on success. Fires a [Message Delete](https://discord.com/developers/docs/topics/gateway#message-delete) Gateway event.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/channel#delete-message
 */
export const deleteMessage = mutation(deleteMessageSchema, async ({ channel, message }) =>
  remove(`/channels/${channel}/messages/${message}`)
);
