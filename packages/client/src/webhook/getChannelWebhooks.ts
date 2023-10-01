import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "@discordkit/core";
import { webhookSchema, type Webhook } from "./types/Webhook.ts";

export const getChannelWebhooksSchema = z.object({
  channel: z.string().min(1)
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
  webhookSchema.array()
);

export const getChannelWebhooksProcedure = toProcedure(
  `query`,
  getChannelWebhooks,
  getChannelWebhooksSchema,
  webhookSchema.array()
);

export const getChannelWebhooksQuery = toQuery(getChannelWebhooks);