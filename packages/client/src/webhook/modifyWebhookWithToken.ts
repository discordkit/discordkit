import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { webhookSchema, type Webhook } from "./types/Webhook.js";

export const modifyWebhookWithTokenSchema = v.object({
  webhook: snowflake,
  token: v.pipe(v.string(), v.nonEmpty()),
  body: v.exactOptional(
    v.partial(
      v.object({
        /** the default name of the webhook */
        name: v.pipe(v.string(), v.nonEmpty()),
        /** image for the default webhook avatar */
        avatar: v.nullable(v.pipe(v.string(), v.url()))
      })
    )
  )
});

/**
 * ### [Modify Webhook with Token](https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token)
 *
 * **PATCH** `/webhooks/:webhook/:token`
 *
 * Modify a webhook. Requires the `MANAGE_WEBHOOKS` permission. Returns the updated {@link Webhook | webhook object} on success. Fires a Webhooks Update Gateway event. This call does not require authentication and does not return a user in the webhook object.
 *
 * > [!NOTE]
 * >
 * > All parameters to this endpoint are optional
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason `header.
 */
export const modifyWebhookWithToken: Fetcher<
  typeof modifyWebhookWithTokenSchema,
  Omit<Webhook, `user`>
> = async ({ webhook, token, body }) =>
  patch(`/webhooks/${webhook}/${token}`, body);

export const modifyWebhookWithTokenSafe = toValidated(
  modifyWebhookWithToken,
  modifyWebhookWithTokenSchema,
  v.omit(webhookSchema, [`user`])
);

export const modifyWebhookWithTokenProcedure = toProcedure(
  `mutation`,
  modifyWebhookWithToken,
  modifyWebhookWithTokenSchema,
  v.omit(webhookSchema, [`user`])
);
