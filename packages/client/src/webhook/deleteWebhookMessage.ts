import { object, string, minLength, partial, optional } from "valibot";
import {
  remove,
  buildURL,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteWebhookMessageSchema = object({
  webhook: snowflake,
  token: string([minLength(1)]),
  message: snowflake,
  params: optional(
    partial(
      object({
        /** id of the thread the message is in */
        threadId: snowflake
      })
    )
  )
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

export const deleteWebhookMessageSafe = toValidated(
  deleteWebhookMessage,
  deleteWebhookMessageSchema
);

export const deleteWebhookMessageProcedure = toProcedure(
  `mutation`,
  deleteWebhookMessage,
  deleteWebhookMessageSchema
);
