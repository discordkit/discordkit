import { z } from "zod";
import { mutation, post } from "../utils";

export const bulkDeleteMessagesSchema = z.object({
  channel: z.string().min(1),
  body: z.object({
    /** an array of message ids to delete (2-100) */
    messages: z.array(z.string()).min(2).max(100)
  })
});

/**
 * Delete multiple messages in a single request. This endpoint can only be used on guild channels and requires the `MANAGE_MESSAGES` permission. Returns a 204 empty response on success. Fires a [Message Delete Bulk](https://discord.com/developers/docs/topics/gateway#message-delete-bulk) Gateway event.
 *
 * Any message IDs given that do not exist or are invalid will count towards the minimum and maximum message count (currently 2 and 100 respectively).
 *
 * *This endpoint will not delete messages older than 2 weeks, and will fail with a 400 BAD REQUEST if any message provided is older than that or if any duplicate message IDs are provided.*
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/channel#bulk-delete-messages
 */
export const bulkDeleteMessages = mutation(
  bulkDeleteMessagesSchema,
  async ({ channel, body }) =>
    post(`/channels/${channel}/messages/bulk-delete`, body)
);
