import { z } from "zod";
import { mutation, patch } from "../utils";
import type { Webhook } from "./types";

export const modifyWebhookWithTokenSchema = z.object({
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
 * Same as modifyWebhook, except this call does not require authentication, does not accept a channel_id parameter in the body, and does not return a user in the webhook object.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token
 */
export const modifyWebhookWithToken = mutation(modifyWebhookWithTokenSchema, async ({ webhook, token, body }) =>
  patch<Webhook>(`/webhooks/${webhook}/${token}`, body)
);
