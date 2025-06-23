import { array, maxLength, minLength, object, pipe } from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const bulkDeleteMessagesSchema = object({
  channel: snowflake,
  body: object({
    /** an array of message ids to delete (2-100) */
    messages: pipe(array(snowflake), minLength(2), maxLength(100))
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
 * > [!WARNING]
 * >
 * > This endpoint will not delete messages older than 2 weeks, and will fail with a `400 BAD REQUEST` if any message provided is older than that or if any duplicate message IDs are provided.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const bulkDeleteMessages: Fetcher<
  typeof bulkDeleteMessagesSchema
> = async ({ channel, body }) =>
  post(`/channels/${channel}/messages/bulk-delete`, body);

export const bulkDeleteMessagesSafe = toValidated(
  bulkDeleteMessages,
  bulkDeleteMessagesSchema
);

export const bulkDeleteMessagesProcedure = toProcedure(
  `mutation`,
  bulkDeleteMessages,
  bulkDeleteMessagesSchema
);
