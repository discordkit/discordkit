import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { webhookSchema, type Webhook } from "./types/Webhook.js";

export const getGuildWebhooksSchema = z.object({
  guild: snowflake
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

export const getGuildWebhooksSafe = toValidated(
  getGuildWebhooks,
  getGuildWebhooksSchema,
  webhookSchema.array()
);

export const getGuildWebhooksProcedure = toProcedure(
  `query`,
  getGuildWebhooks,
  getGuildWebhooksSchema,
  webhookSchema.array()
);

export const getGuildWebhooksQuery = toQuery(getGuildWebhooks);
