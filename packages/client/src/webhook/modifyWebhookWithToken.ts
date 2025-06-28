import {
  object,
  string,
  url,
  partial,
  omit,
  pipe,
  nullable,
  nonEmpty,
  exactOptional
} from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { webhookSchema, type Webhook } from "./types/Webhook.js";

export const modifyWebhookWithTokenSchema = object({
  webhook: snowflake,
  token: pipe(string(), nonEmpty()),
  body: exactOptional(
    partial(
      object({
        /** the default name of the webhook */
        name: pipe(string(), nonEmpty()),
        /** image for the default webhook avatar */
        avatar: nullable(pipe(string(), url()))
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
  omit(webhookSchema, [`user`])
);

export const modifyWebhookWithTokenProcedure = toProcedure(
  `mutation`,
  modifyWebhookWithToken,
  modifyWebhookWithTokenSchema,
  omit(webhookSchema, [`user`])
);
