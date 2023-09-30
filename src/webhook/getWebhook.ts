import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "#/utils/index.ts";
import { webhookSchema, type Webhook } from "./types/Webhook.ts";

export const getWebhookSchema = z.object({
  webhook: z.string().min(1)
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
