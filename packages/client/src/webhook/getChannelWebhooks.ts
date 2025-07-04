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

export const getChannelWebhooksSchema = v.object({
  channel: snowflake
});

/**
 * ### [Get Channel Webhooks](https://discord.com/developers/docs/resources/webhook#get-channel-webhooks)
 *
 * **GET** `/channels/:channel/webhooks`
 *
 * Returns a list of channel webhook objects. Requires the `MANAGE_WEBHOOKS` permission.
 */
export const getChannelWebhooks: Fetcher<
  typeof getChannelWebhooksSchema,
  Webhook[]
> = async ({ channel }) => get(`/channels/${channel}/webhooks`);

export const getChannelWebhooksSafe = toValidated(
  getChannelWebhooks,
  getChannelWebhooksSchema,
  v.array(webhookSchema)
);

export const getChannelWebhooksProcedure = toProcedure(
  `query`,
  getChannelWebhooks,
  getChannelWebhooksSchema,
  v.array(webhookSchema)
);

export const getChannelWebhooksQuery = toQuery(getChannelWebhooks);
