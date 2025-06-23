import {
  pipe,
  object,
  string,
  minLength,
  partial,
  exactOptional
} from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { messageSchema, type Message } from "../channel/types/Message.js";

export const getWebhookMessageSchema = object({
  webhook: snowflake,
  token: pipe(string(), minLength(1)),
  message: snowflake,
  params: exactOptional(
    partial(
      object({
        /** id of the thread the message is in */
        threadId: snowflake
      })
    )
  )
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
