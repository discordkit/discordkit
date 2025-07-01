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

export const getWebhookWithTokenSchema = v.object({
  webhook: snowflake,
  token: v.pipe(v.string(), v.nonEmpty())
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
  Omit<Webhook, `user`>
> = async ({ webhook, token }) => get(`/webhooks/${webhook}/${token}`);

export const getWebhookWithTokenSafe = toValidated(
  getWebhookWithToken,
  getWebhookWithTokenSchema,
  v.omit(webhookSchema, [`user`])
);

export const getWebhookWithTokenProcedure = toProcedure(
  `query`,
  getWebhookWithToken,
  getWebhookWithTokenSchema,
  v.omit(webhookSchema, [`user`])
);

export const getWebhookWithTokenQuery = toQuery(getWebhookWithToken);
