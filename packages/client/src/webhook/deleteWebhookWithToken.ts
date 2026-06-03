import * as v from "valibot";
import { remove, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const deleteWebhookWithTokenSchema = v.object({
  webhook: snowflake,
  token: boundedString()
});

/**
 * ### [Delete Webhook with Token](https://discord.com/developers/docs/resources/webhook#delete-webhook-with-token)
 *
 * **DELETE** `/webhooks/:webhook/:token`
 *
 * Delete a webhook permanently. Returns a `204 No Content` response on success. Fires a Webhooks Update Gateway event. Same as Delete Webhook, except this call does not require authentication.
 */
export const deleteWebhookWithToken: Fetcher<
  typeof deleteWebhookWithTokenSchema,
  void,
  { anonymous: true }
> = async ({ webhook, token }, options) =>
  remove(`/webhooks/${webhook}/${token}`, options);
