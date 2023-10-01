import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { webhookSchema, type Webhook } from "./types/Webhook.ts";

export const modifyWebhookWithTokenSchema = z.object({
  webhook: snowflake,
  token: z.string().min(1),
  body: z
    .object({
      /** the default name of the webhook */
      name: z.string().min(1),
      /** image for the default webhook avatar */
      avatar: z.string().url().min(1)
    })
    .partial()
});

/**
 * ### [Modify Webhook with Token](https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token)
 *
 * **PATCH** `/webhooks/:webhook/:token`
 *
 * Modify a webhook. Requires the `MANAGE_WEBHOOKS` permission. Returns the updated {@link Webhook | webhook object} on success. Fires a Webhooks Update Gateway event. This call does not require authentication and does not return a user in the webhook object.
 *
 * > **NOTE**
 * >
 * > All parameters to this endpoint are optional
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason `header.
 */
export const modifyWebhookWithToken: Fetcher<
  typeof modifyWebhookWithTokenSchema,
  Omit<Webhook, "user">
> = async ({ webhook, token, body }) =>
  patch(`/webhooks/${webhook}/${token}`, body);

export const modifyWebhookWithTokenSafe = toValidated(
  modifyWebhookWithToken,
  modifyWebhookWithTokenSchema,
  webhookSchema.omit({ user: true })
);

export const modifyWebhookWithTokenProcedure = toProcedure(
  `mutation`,
  modifyWebhookWithToken,
  modifyWebhookWithTokenSchema,
  webhookSchema.omit({ user: true })
);
