import { z } from "zod";
import { remove, type Fetcher } from "../utils";

export const deleteWebhookWithTokenSchema = z.object({
  webhook: z.string().min(1),
  token: z.string().min(1)
});

/**
 * Same as deleteWebhook, except this call does not require authentication.
 *
 * https://discord.com/developers/docs/resources/webhook#delete-webhook-with-token
 */
export const deleteWebhookWithToken: Fetcher<
  typeof deleteWebhookWithTokenSchema
> = async ({ webhook, token }) => remove(`/webhooks/${webhook}/${token}`);
