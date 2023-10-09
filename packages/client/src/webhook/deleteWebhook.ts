import { object } from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteWebhookSchema = object({
  webhook: snowflake
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

export const deleteWebhookSafe = toValidated(
  deleteWebhook,
  deleteWebhookSchema
);

export const deleteWebhookProcedure = toProcedure(
  `mutation`,
  deleteWebhook,
  deleteWebhookSchema
);
