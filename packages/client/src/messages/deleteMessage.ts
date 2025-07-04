import * as v from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteMessageSchema = v.object({
  channel: snowflake,
  message: snowflake
});

/**
 * ### [Delete Message](https://discord.com/developers/docs/resources/channel#delete-message)
 *
 * **DELETE** `/channels/:channel/messages/:message`
 *
 * Delete a message. If operating on a guild channel and trying to delete a message that was not sent by the current user, this endpoint requires the `MANAGE_MESSAGES` permission. Returns a `204 empty` response on success. Fires a Message Delete Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteMessage: Fetcher<typeof deleteMessageSchema> = async ({
  channel,
  message
}) => remove(`/channels/${channel}/messages/${message}`);

export const deleteMessageSafe = toValidated(
  deleteMessage,
  deleteMessageSchema
);

export const deleteMessageProcedure = toProcedure(
  `mutation`,
  deleteMessage,
  deleteMessageSchema
);
