import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { Webhook } from "./types";

export const getWebhookWithTokenSchema = z.object({
  webhook: z.string().min(1),
  token: z.string().min(1)
});

/**
 * **GET** `/webhooks/{webhook.id}/{webhook.token}`
 *
 * Same as above, except this call does not require authentication and returns no user in the webhook object.
 *
 * https://discord.com/developers/docs/resources/webhook#get-webhook-with-token
 */
export const getWebhookWithToken: Fetcher<
  typeof getWebhookWithTokenSchema,
  Webhook
> = async ({ webhook, token }) => get(`/webhooks/${webhook}/${token}`);
