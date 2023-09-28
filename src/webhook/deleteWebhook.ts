import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "#/utils/index.ts";

export const deleteWebhookSchema = z.object({
  webhook: z.string().min(1)
});

/**
 * ### [Delete Webhook](https://discord.com/developers/docs/resources/webhook#delete-webhook)
 *
 * **DELETE** `/webhooks/:webhook`
 *
 * Delete a webhook permanently. Requires the `MANAGE_WEBHOOKS` permission. Returns a `204 No Content` response on success. Fires a Webhooks Update Gateway event.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteWebhook: Fetcher<typeof deleteWebhookSchema> = async ({
  webhook
}) => remove(`/webhooks/${webhook}`);

export const deleteWebhookProcedure = toProcedure(
  `mutation`,
  deleteWebhook,
  deleteWebhookSchema
);
