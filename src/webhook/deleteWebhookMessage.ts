import { z } from "zod";
import { mutation, remove, buildURL } from "../utils";

export const deleteWebhookMessageSchema = z.object({
  webhook: z.string().min(1),
  token: z.string().min(1),
  message: z.string().min(1),
  params: z
    .object({
      /** id of the thread the message is in */
      threadId: z.string().min(1).optional()
    })
    .optional()
});

/**
 * Deletes a message that was created by the webhook. Returns a `204 No Content` response on success.
 *
 * https://discord.com/developers/docs/resources/webhook#delete-webhook-message
 */
export const deleteWebhookMessage = mutation(deleteWebhookMessageSchema, async ({ webhook, token, message, params }) =>
  remove(buildURL(`/webhooks/${webhook}/${token}/messages/${message}`, params).href)
);
