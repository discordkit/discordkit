import * as v from "valibot";
import { remove, type Fetcher, snowflake } from "@discordkit/core";

export const deleteMessageSchema = v.object({
  channel: snowflake,
  message: snowflake
});

/**
 * ### [Delete Message](https://discord.com/developers/docs/resources/message#delete-message)
 *
 * **DELETE** `/channels/:channel/messages/:message`
 *
 * Delete a message. If operating on a guild channel and trying to delete a message that was not sent by the current user, this endpoint requires the `MANAGE_MESSAGES` permission. Returns a 204 empty response on success. Fires a Message Delete Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteMessage: Fetcher<
  typeof deleteMessageSchema,
  void,
  { auditLogReason: true }
> = async ({ channel, message }, options) =>
  remove(`/channels/${channel}/messages/${message}`, options);
