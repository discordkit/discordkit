import { z } from "zod";
import { get, query } from "../utils";
import type { Webhook } from "./types";

export const getGuildWebhooksSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a list of guild webhook objects. Requires the `MANAGE_WEBHOOKS` permission.
 *
 * https://discord.com/developers/docs/resources/webhook#get-guild-webhooks
 */
export const getGuildWebhooks = query(getGuildWebhooksSchema, ({ guild }) =>
  get<Webhook[]>(`/guilds/${guild}/webhooks`)
);
