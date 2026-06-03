import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type Webhook } from "./types/Webhook.js";

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
 * This request requires the `MANAGE_WEBHOOKS` permission unless the application making the request owns the webhook. (see: webhook.application_id)
 */
export const getWebhook: Fetcher<typeof getWebhookSchema, Webhook> = async ({
  webhook
}) => get(`/webhooks/${webhook}`);
