import { z } from "zod";
import type { Message } from "../channel";
import { query, get } from "../utils";

export const getWebhookMessageSchema = z.object({
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
 * Returns a previously-sent webhook message from the same token. Returns a message object on success.
 *
 * https://discord.com/developers/docs/resources/webhook#get-webhook-message
 */
export const getWebhookMessage = query(getWebhookMessageSchema, ({ webhook, token, message, params }) =>
  get<Message>(`/webhooks/${webhook}/${token}/messages/${message}`, params)
);
