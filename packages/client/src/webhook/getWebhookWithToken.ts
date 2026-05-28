import * as v from "valibot";
import { get, type Fetcher, snowflake, boundedString } from "@discordkit/core";
import { type Webhook } from "./types/Webhook.js";

export const getWebhookWithTokenSchema = v.object({
  webhook: snowflake,
  token: boundedString()
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
  Omit<Webhook, `user`>,
  { anonymous: true }
> = async ({ webhook, token }, options) =>
  get(`/webhooks/${webhook}/${token}`, undefined, options);
