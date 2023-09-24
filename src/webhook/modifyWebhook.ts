import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "../utils";
import { webhookSchema, type Webhook } from "./types/Webhook";

export const modifyWebhookSchema = z.object({
  webhook: z.string().min(1),
  token: z.string().min(1),
  body: z
    .object({
      /** the default name of the webhook */
      name: z.string().min(1),
      /** image for the default webhook avatar */
      avatar: z.string().min(1),
      /** the new channel id this webhook should be moved to */
      channelId: z.string().min(1)
    })
    .partial()
});

/**
 * **PATCH** `/webhooks/{webhook.id}`
 *
 * Modify a webhook. Requires the `MANAGE_WEBHOOKS` permission. Returns the updated [webhook](./types/Webhook.ts) object on success. Fires a [Webhooks Update](https://discord.com/developers/docs/topics/gateway-events#webhooks-update) Gateway event.
 *
 * > **NOTE**
 * >
 * > All parameters to this endpoint are optional
 *
 * > **NOTE**
 * >
 * > This endpoint supports the X-Audit-Log-Reason header.
 *
 * https://discord.com/developers/docs/resources/webhook#modify-webhook
 */
export const modifyWebhook: Fetcher<
  typeof modifyWebhookSchema,
  Webhook
> = async ({ webhook, body }) => patch(`/webhooks/${webhook}`, body);

export const modifyWebhookProcedure = toProcedure(
  `mutation`,
  modifyWebhook,
  modifyWebhookSchema,
  webhookSchema
);
