import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { webhookSchema, type Webhook } from "./types/Webhook";

export const getGuildWebhooksSchema = z.object({
  guild: z.string().min(1)
});

/**
 * **GET** `/guilds/{guild.id}/webhooks`
 *
 * Returns a list of guild webhook objects. Requires the `MANAGE_WEBHOOKS` permission.
 *
 * https://discord.com/developers/docs/resources/webhook#get-guild-webhooks
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
