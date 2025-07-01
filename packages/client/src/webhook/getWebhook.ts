import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { webhookSchema, type Webhook } from "./types/Webhook.js";

export const getWebhookSchema = v.object({
  webhook: snowflake
});

/**
 * ### [Get Webhook](https://discord.com/developers/docs/resources/webhook#get-webhook)
 *
 * **GET** `/webhooks/:webhook`
 *
 * Returns the new {@link Webhook | webhook object} for the given id.
 *
 * This request requires the `MANAGE_WEBHOOKS` permission unless the application making the request owns the webhook. [(see: webhook.application_id)](https://discord.com/developers/docs/resources/webhook#webhook-object)
 */
export const getWebhook: Fetcher<typeof getWebhookSchema, Webhook> = async ({
  webhook
}) => get(`/webhooks/${webhook}`);

export const getWebhookSafe = toValidated(
  getWebhook,
  getWebhookSchema,
  webhookSchema
);

export const getWebhookProcedure = toProcedure(
  `query`,
  getWebhook,
  getWebhookSchema,
  webhookSchema
);

export const getWebhookQuery = toQuery(getWebhook);
