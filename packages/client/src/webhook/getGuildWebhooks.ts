import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type Webhook } from "./types/Webhook.js";

export const getGuildWebhooksSchema = v.object({
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
