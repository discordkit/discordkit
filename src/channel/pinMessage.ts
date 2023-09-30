import { z } from "zod";
import { put, type Fetcher, toProcedure, toValidated } from "#/utils/index.ts";

export const pinMessageSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1)
});

/**
 * ## [Pin Message](https://discord.com/developers/docs/resources/channel#pin-message)
 *
 * **PUT** `/channels/:channel/pins/:message`
 *
 * Pin a message in a channel. Requires the `MANAGE_MESSAGES` permission. Returns a `204 empty` response on success. Fires a Channel Pins Update Gateway event.
 *
 * > **WARNING**
 * >
 * > The max pinned messages is 50.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const pinMessage: Fetcher<typeof pinMessageSchema> = async ({
  channel,
  message
}) => put(`/channels/${channel}/pins/${message}`);

export const pinMessageSafe = toValidated(pinMessage, pinMessageSchema);

export const pinMessageProcedure = toProcedure(
  `mutation`,
  pinMessage,
  pinMessageSchema
);
