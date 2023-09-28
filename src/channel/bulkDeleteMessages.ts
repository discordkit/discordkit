import { z } from "zod";
import { post, type Fetcher, toProcedure } from "#/utils/index.ts";

export const bulkDeleteMessagesSchema = z.object({
  channel: z.string().min(1),
  body: z.object({
    /** an array of message ids to delete (2-100) */
    messages: z.string().min(1).array().min(2).max(100)
  })
});

/**
 * ### [Bulk Delete Messages](https://discord.com/developers/docs/resources/channel#bulk-delete-messages)
 *
 * **POST** `/channels/:channel/messages/bulk-delete`
 *
 * Delete multiple messages in a single request. This endpoint can only be used on guild channels and requires the `MANAGE_MESSAGES` permission. Returns a `204 empty` response on success. Fires a Message Delete Bulk Gateway event.
 *
 * Any message IDs given that do not exist or are invalid will count towards the minimum and maximum message count (currently 2 and 100 respectively).
 *
 * > **WARNING**
 * >
 * > This endpoint will not delete messages older than 2 weeks, and will fail with a `400 BAD REQUEST` if any message provided is older than that or if any duplicate message IDs are provided.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const bulkDeleteMessages: Fetcher<
  typeof bulkDeleteMessagesSchema
> = async ({ channel, body }) =>
  post(`/channels/${channel}/messages/bulk-delete`, body);

export const bulkDeleteMessagesProcedure = toProcedure(
  `mutation`,
  bulkDeleteMessages,
  bulkDeleteMessagesSchema
);
