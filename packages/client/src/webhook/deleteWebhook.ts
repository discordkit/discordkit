import * as v from "valibot";
import { remove, type Fetcher, snowflake } from "@discordkit/core";

export const deleteWebhookSchema = v.object({
  webhook: snowflake
});

/**
 * ### [Delete Webhook](https://discord.com/developers/docs/resources/webhook#delete-webhook)
 *
 * **DELETE** `/webhooks/:webhook`
 *
 * Delete a webhook permanently. Requires the `MANAGE_WEBHOOKS` permission. Returns a `204 No Content` response on success. Fires a Webhooks Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteWebhook: Fetcher<
  typeof deleteWebhookSchema,
  void,
  { auditLogReason: true }
> = async ({ webhook }, options) => remove(`/webhooks/${webhook}`, options);
