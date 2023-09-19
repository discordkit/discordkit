import { z } from "zod";
import { patch, type Fetcher, createProcedure } from "../utils";
import { webhookSchema, type Webhook } from "./types";

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
 * **PATCH** `/webhooks/{webhook.id}/{webhook.token}`
 *
 * Same as above, except this call does not require authentication, does not accept a `channel_id` parameter in the body, and does not return a user in the webhook object.
 *
 * https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token
 */
export const modifyWebhookWithToken: Fetcher<
  typeof modifyWebhookWithTokenSchema,
  Webhook
> = async ({ webhook, token, body }) =>
  patch(`/webhooks/${webhook}/${token}`, body);

export const modifyWebhookWithTokenProcedure = createProcedure(
  `mutation`,
  modifyWebhookWithToken,
  modifyWebhookWithTokenSchema,
  webhookSchema
);
