import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { Webhook } from "./types";

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
