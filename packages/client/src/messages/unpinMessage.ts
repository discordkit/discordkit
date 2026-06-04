import * as v from "valibot";
import { remove, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const unpinMessageSchema = v.object({
  channel: snowflake,
  message: snowflake
});

/**
 * ### [Unpin Message](https://discord.com/developers/docs/resources/message#unpin-message)
 *
 * **DELETE** `/channels/:channel/messages/pins/:message`
 *
 * Unpin a message in a channel. Requires the `PIN_MESSAGES` permission. Returns a 204 empty response on success. Fires a Channel Pins Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const unpinMessage: Fetcher<
  typeof unpinMessageSchema,
  void,
  { auditLogReason: true }
> = async ({ channel, message }, options) =>
  remove(`/channels/${channel}/messages/pins/${message}`, options);
