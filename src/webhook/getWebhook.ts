import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { Webhook } from "./types";

export const getWebhookSchema = z.object({
  webhook: z.string().min(1)
});

/**
 * **GET** `/webhooks/{webhook.id}`
 *
 * Returns the new webhook object for the given id.
 *
 * https://discord.com/developers/docs/resources/webhook#get-webhook
 */
export const getWebhook: Fetcher<typeof getWebhookSchema, Webhook> = async ({
  webhook
}) => get(`/webhooks/${webhook}`);
