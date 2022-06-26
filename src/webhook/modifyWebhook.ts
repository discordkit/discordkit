import { z } from "zod";
import { mutation, patch } from "../utils";
import type { Webhook } from "./types";

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
 * Modify a webhook. Requires the `MANAGE_WEBHOOKS` permission. Returns the updated webhook object on success.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/webhook#modify-webhook
 */
export const modifyWebhook = mutation(modifyWebhookSchema, async ({ webhook, body }) =>
  patch<Webhook>(`/webhooks/${webhook}`, body)
);
