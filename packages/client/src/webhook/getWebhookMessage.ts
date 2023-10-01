import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "@discordkit/core";
import { messageSchema, type Message } from "#/channel/types/Message.ts";

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
 * ### [Get Webhook Message](https://discord.com/developers/docs/resources/webhook#get-webhook-message)
 *
 * **GET** `/webhooks/:ebhook/:token/messages/:message`
 *
 * Returns a previously-sent webhook message from the same token. Returns a {@link Message | message object} on success.
 */
export const getWebhookMessage: Fetcher<
  typeof getWebhookMessageSchema,
  Message
> = async ({ webhook, token, message, params }) =>
  get(`/webhooks/${webhook}/${token}/messages/${message}`, params);

export const getWebhookMessageSafe = toValidated(
  getWebhookMessage,
  getWebhookMessageSchema,
  messageSchema
);

export const getWebhookMessageProcedure = toProcedure(
  `query`,
  getWebhookMessage,
  getWebhookMessageSchema,
  messageSchema
);

export const getWebhookMessageQuery = toQuery(getWebhookMessage);
