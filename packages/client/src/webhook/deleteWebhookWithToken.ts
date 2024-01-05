import { object, string, minLength } from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteWebhookWithTokenSchema = object({
  webhook: snowflake,
  token: string([minLength(1)])
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

export const deleteWebhookWithTokenSafe = toValidated(
  deleteWebhookWithToken,
  deleteWebhookWithTokenSchema
);

export const deleteWebhookWithTokenProcedure = toProcedure(
  `mutation`,
  deleteWebhookWithToken,
  deleteWebhookWithTokenSchema
);
