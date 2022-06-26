import { z } from "zod";
import { mutation, remove } from "../utils";

export const deleteWebhookSchema = z.object({
  webhook: z.string().min(1)
});

/**
 * Delete a webhook permanently. Requires the `MANAGE_WEBHOOKS` permission. Returns a `204 No Content` response on success.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/webhook#delete-webhook
 */
export const deleteWebhook = mutation(deleteWebhookSchema, async ({ webhook }) => remove(`/webhooks/${webhook}`));
