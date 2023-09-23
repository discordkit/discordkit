import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { webhookSchema, type Webhook } from "./types";

export const getChannelWebhooksSchema = z.object({
  channel: z.string().min(1)
});

/**
 * **GET** `/channels/{channel.id}/webhooks`
 *
 * Returns a list of channel webhook objects. Requires the `MANAGE_WEBHOOKS` permission.
 *
 * https://discord.com/developers/docs/resources/webhook#get-channel-webhooks
 */
export const getChannelWebhooks: Fetcher<
  typeof getChannelWebhooksSchema,
  Webhook[]
> = async ({ channel }) => get(`/channels/${channel}/webhooks`);

export const getChannelWebhooksProcedure = toProcedure(
  `query`,
  getChannelWebhooks,
  getChannelWebhooksSchema,
  webhookSchema.array()
);

export const getChannelWebhooksQuery = toQuery(getChannelWebhooks);
