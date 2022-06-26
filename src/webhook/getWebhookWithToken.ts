import { z } from "zod";
import { query, get } from "../utils";
import type { Webhook } from "./types";

export const getWebhookWithTokenSchema = z.object({
  webhook: z.string().min(1),
  token: z.string().min(1)
});

/**
 * Same as above, except this call does not require authentication and returns no user in the webhook object.
 *
 * https://discord.com/developers/docs/resources/webhook#get-webhook-with-token
 */
export const getWebhookWithToken = query(getWebhookWithTokenSchema, ({ webhook, token }) =>
  get<Webhook>(`/webhooks/${webhook}/${token}`)
);
