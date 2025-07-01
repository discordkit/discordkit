import * as v from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const unpinMessageSchema = v.object({
  channel: snowflake,
  message: snowflake
});

/**
 * ### [Unpin Message](https://discord.com/developers/docs/resources/channel#unpin-message)
 *
 * **DELETE** `/channels/:channel/messages/pins/:message`
 *
 * Unpin a message in a channel. Requires the `MANAGE_MESSAGES` permission. Returns a `204 empty` response on success. Fires a Channel Pins Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const unpinMessage: Fetcher<typeof unpinMessageSchema> = async ({
  channel,
  message
}) => remove(`/channels/${channel}/messages/pins/${message}`);

export const unpinMessageSafe = toValidated(unpinMessage, unpinMessageSchema);

export const unpinMessageProcedure = toProcedure(
  `mutation`,
  unpinMessage,
  unpinMessageSchema
);
