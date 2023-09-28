import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "#/utils/index.ts";

export const deleteWebhookWithTokenSchema = z.object({
  webhook: z.string().min(1),
  token: z.string().min(1)
});

/**
 * ### [Delete Webhook with Token](https://discord.com/developers/docs/resources/webhook#delete-webhook-with-token)
 *
 * **DELETE** `/webhooks/:webhook/:token`
 *
 * Deletes a message that was created by the webhook. Returns a `204 No Content` response on success. Does not require authentication.
 */
export const deleteWebhookWithToken: Fetcher<
  typeof deleteWebhookWithTokenSchema
> = async ({ webhook, token }) => remove(`/webhooks/${webhook}/${token}`);

export const deleteWebhookWithTokenProcedure = toProcedure(
  `mutation`,
  deleteWebhookWithToken,
  deleteWebhookWithTokenSchema
);
