import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { webhookSchema, type Webhook } from "./types/Webhook.js";

export const getWebhookSchema = z.object({
  webhook: snowflake
});

/**
 * ### [Get Webhook](https://discord.com/developers/docs/resources/webhook#get-webhook)
 *
 * **GET** `/webhooks/:webhook`
 *
 * Returns the new {@link Webhook | webhook object} for the given id.
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
