import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { Webhook } from "./types/Webhook.js";

export const getWebhookWithTokenSchema = v.object({
  webhook: snowflake,
  token: boundedString()
});

/**
 * ### [Get Webhook with Token](https://discord.com/developers/docs/resources/webhook#get-webhook-with-token)
 *
 * **GET** `/webhooks/:webhook/:token`
 *
 * Returns the {@link Webhook | webhook object} for the given id. Same as Get Webhook, except this call does not require authentication and returns no user in the {@link Webhook | webhook object}.
 */
export const getWebhookWithToken: Fetcher<
  typeof getWebhookWithTokenSchema,
  Omit<Webhook, `user`>,
  { anonymous: true }
> = async ({ webhook, token }, options) =>
  get(`/webhooks/${webhook}/${token}`, undefined, options);
