import { z } from "zod";
import { get, query } from "../utils";
import type { Webhook } from "./types";

export const getChannelWebhooksSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Returns a list of channel webhook objects. Requires the `MANAGE_WEBHOOKS` permission.
 *
 * https://discord.com/developers/docs/resources/webhook#get-channel-webhooks
 */
export const getChannelWebhooks = query(getChannelWebhooksSchema, ({ channel }) =>
  get<Webhook[]>(`/channels/${channel}/webhooks`)
);
