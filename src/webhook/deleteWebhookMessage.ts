import { z } from "zod";
import { remove, buildURL, type Fetcher, toProcedure } from "#/utils/index.ts";

export const deleteWebhookMessageSchema = z.object({
  webhook: z.string().min(1),
  token: z.string().min(1),
  message: z.string().min(1),
  params: z
    .object({
      /** id of the thread the message is in */
      threadId: z.string().min(1)
    })
    .partial()
    .optional()
});

/**
 * ### [Delete Webhook Message](https://discord.com/developers/docs/resources/webhook#delete-webhook-message)
 *
 * **DELETE** `/webhooks/:webhook/:token/messages/:message`
 *
 * Deletes a message that was created by the webhook. Returns a `204 No Content` response on success.
 */
export const deleteWebhookMessage: Fetcher<
  typeof deleteWebhookMessageSchema
> = async ({ webhook, token, message, params }) =>
  remove(
    buildURL(`/webhooks/${webhook}/${token}/messages/${message}`, params).href
  );

export const deleteWebhookMessageProcedure = toProcedure(
  `mutation`,
  deleteWebhookMessage,
  deleteWebhookMessageSchema
);
