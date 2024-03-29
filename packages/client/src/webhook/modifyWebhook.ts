import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { webhookSchema, type Webhook } from "./types/Webhook.js";

export const modifyWebhookSchema = z.object({
  webhook: snowflake,
  body: z
    .object({
      /** the default name of the webhook */
      name: z.string().min(1),
      /** image for the default webhook avatar */
      avatar: z.string().url().min(1),
      /** the new channel id this webhook should be moved to */
      channelId: snowflake
    })
    .partial()
});

/**
 * ### [Modify Webhook](https://discord.com/developers/docs/resources/webhook#modify-webhook)
 *
 * **PATCH** `/webhooks/:webhook`
 *
 * Modify a webhook. Requires the `MANAGE_WEBHOOKS` permission. Returns the updated {@link Webhook | webhook object} on success. Fires a Webhooks Update Gateway event.
 *
 * > **NOTE**
 * >
 * > All parameters to this endpoint are optional
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason `header.
 */
export const modifyWebhook: Fetcher<
  typeof modifyWebhookSchema,
  Webhook
> = async ({ webhook, body }) => patch(`/webhooks/${webhook}`, body);

export const modifyWebhookSafe = toValidated(
  modifyWebhook,
  modifyWebhookSchema,
  webhookSchema
);

export const modifyWebhookProcedure = toProcedure(
  `mutation`,
  modifyWebhook,
  modifyWebhookSchema,
  webhookSchema
);
