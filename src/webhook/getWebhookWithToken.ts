import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "#/utils/index.ts";
import { webhookSchema, type Webhook } from "./types/Webhook.ts";

export const getWebhookWithTokenSchema = z.object({
  webhook: z.string().min(1),
  token: z.string().min(1)
});

/**
 * ### [Get Webhook with Token](https://discord.com/developers/docs/resources/webhook#get-webhook-with-token)
 *
 * **GET** `/webhooks/:webhook/:token`
 *
 * Returns the new {@link Webhook | webhook object} for the given id, except this call does not require authentication and returns no user in the webhook object.
 */
export const getWebhookWithToken: Fetcher<
  typeof getWebhookWithTokenSchema,
  Omit<Webhook, "user">
> = async ({ webhook, token }) => get(`/webhooks/${webhook}/${token}`);

export const getWebhookWithTokenSafe = toValidated(
  getWebhookWithToken,
  getWebhookWithTokenSchema,
  webhookSchema.omit({ user: true })
);

export const getWebhookWithTokenProcedure = toProcedure(
  `query`,
  getWebhookWithToken,
  getWebhookWithTokenSchema,
  webhookSchema.omit({ user: true })
);

export const getWebhookWithTokenQuery = toQuery(getWebhookWithToken);
