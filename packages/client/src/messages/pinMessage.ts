import * as v from "valibot";
import { put, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const pinMessageSchema = v.object({
  channel: snowflake,
  message: snowflake
});

/**
 * ## [Pin Message](https://discord.com/developers/docs/resources/channel#pin-message)
 *
 * **PUT** `/channels/:channel/messages/pins/:message`
 *
 * Pin a message in a channel. Requires the `MANAGE_MESSAGES` permission. Returns a `204 empty` response on success. Fires a Channel Pins Update Gateway event.
 *
 * > [!WARNING]
 * >
 * > The max pinned messages is 50.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const pinMessage: Fetcher<
  typeof pinMessageSchema,
  void,
  { auditLogReason: true }
> = async ({ channel, message }, options) =>
  put(`/channels/${channel}/messages/pins/${message}`, undefined, options);
