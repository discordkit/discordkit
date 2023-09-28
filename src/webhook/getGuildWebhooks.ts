import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import { webhookSchema, type Webhook } from "./types/Webhook.ts";

export const getGuildWebhooksSchema = z.object({
  guild: z.string().min(1)
});

/**
 * ### [Get Guild Webhooks](https://discord.com/developers/docs/resources/webhook#get-guild-webhooks)
 *
 * **GET** `/guilds/:guild/webhooks`
 *
 * Returns a list of guild webhook objects. Requires the `MANAGE_WEBHOOKS` permission.
 */
export const getGuildWebhooks: Fetcher<
  typeof getGuildWebhooksSchema,
  Webhook[]
> = async ({ guild }) => get(`/guilds/${guild}/webhooks`);

export const getGuildWebhooksProcedure = toProcedure(
  `query`,
  getGuildWebhooks,
  getGuildWebhooksSchema,
  webhookSchema.array()
);

export const getGuildWebhooksQuery = toQuery(getGuildWebhooks);
