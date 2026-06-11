import * as v from "valibot";
import { patch, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { url } from "@discordkit/core/validations/url";
import type { Webhook } from "./types/Webhook.js";

export const modifyWebhookWithTokenSchema = v.object({
  webhook: snowflake,
  token: boundedString(),
  body: v.exactOptional(
    v.partial(
      v.object({
        /** the default name of the webhook */
        name: boundedString(),
        /** image for the default webhook avatar */
        avatar: url
      })
    )
  )
});

/**
 * ### [Modify Webhook with Token](https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token)
 *
 * **PATCH** `/webhooks/:webhook/:token`
 *
 * Modify a webhook. Returns the updated {@link Webhook | webhook object} on success. Fires a Webhooks Update Gateway event. Same as Modify Webhook, except this call does not require authentication, does not accept a `channelId` parameter in the body, and does not return a user in the {@link Webhook | webhook object}.
 */
export const modifyWebhookWithToken: Fetcher<
  typeof modifyWebhookWithTokenSchema,
  Omit<Webhook, `user`>,
  { anonymous: true; auditLogReason: true }
> = async ({ webhook, token, body }, options) =>
  patch(`/webhooks/${webhook}/${token}`, body, options);
