import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { webhookSchema, type Webhook } from "./types/Webhook";

export const getWebhookWithTokenSchema = z.object({
  webhook: z.string().min(1),
  token: z.string().min(1)
});

/**
 * **GET** `/webhooks/{webhook.id}/{webhook.token}`
 *
 * Same as above, except this call does not require authentication and returns no user in the webhook object.
 *
 * https://discord.com/developers/docs/resources/webhook#get-webhook-with-token
 */
export const getWebhookWithToken: Fetcher<
  typeof getWebhookWithTokenSchema,
  Webhook
> = async ({ webhook, token }) => get(`/webhooks/${webhook}/${token}`);

export const getWebhookWithTokenProcedure = toProcedure(
  `query`,
  getWebhookWithToken,
  getWebhookWithTokenSchema,
  webhookSchema
);

export const getWebhookWithTokenQuery = toQuery(getWebhookWithToken);
