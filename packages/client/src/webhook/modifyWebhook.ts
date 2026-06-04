import * as v from "valibot";
import { patch, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { url } from "@discordkit/core/validations/url";
import { type Webhook } from "./types/Webhook.js";

export const modifyWebhookSchema = v.object({
  webhook: snowflake,
  body: v.exactOptional(
    v.partial(
      v.object({
        /** the default name of the webhook */
        name: boundedString(),
        /** image for the default webhook avatar */
        avatar: url,
        /** the new channel id this webhook should be moved to */
        channelId: snowflake
      })
    )
  )
});

/**
 * ### [Modify Webhook](https://discord.com/developers/docs/resources/webhook#modify-webhook)
 *
 * **PATCH** `/webhooks/:webhook`
 *
 * Modify a webhook. Requires the `MANAGE_WEBHOOKS` permission. Returns the updated {@link Webhook | webhook object} on success. Fires a Webhooks Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > All parameters to this endpoint are optional.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyWebhook: Fetcher<
  typeof modifyWebhookSchema,
  Webhook,
  { auditLogReason: true }
> = async ({ webhook, body }, options) =>
  patch(`/webhooks/${webhook}`, body, options);
