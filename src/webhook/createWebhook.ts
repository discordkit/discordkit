import { z } from "zod";
import { post, type Fetcher, toProcedure } from "#/utils/index.ts";
import { webhookSchema, type Webhook } from "./types/Webhook.ts";

export const createWebhookSchema = z.object({
  channel: z.string().min(1),
  body: z.object({
    /** name of the webhook (1-80 characters) */
    name: z.string().min(1).max(80),
    /** image for the default webhook avatar */
    avatar: z.string().url().nullable().optional()
  })
});

/**
 * ### [Create Webhook](https://discord.com/developers/docs/resources/webhook#create-webhook)
 *
 * **POST** `/channels/:channel/webhooks`
 *
 * Creates a new webhook and returns a {@link Webhook | webhook object} on success. Requires the `MANAGE_WEBHOOKS` permission. Fires a Webhooks Update Gateway event.
 *
 * An error will be returned if a webhook name (`name`) is not valid. A webhook name is valid if:
 *
 * - It does not contain the substrings `clyde` or `discord` (case-insensitive)
 * - It follows the nickname guidelines in the Usernames and Nicknames documentation, with an exception that webhook names can be up to 80 characters
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const createWebhook: Fetcher<
  typeof createWebhookSchema,
  Webhook
> = async ({ channel, body }) => post(`/channels/${channel}/webhooks`, body);

export const createWebhookProcedure = toProcedure(
  `mutation`,
  createWebhook,
  createWebhookSchema,
  webhookSchema
);
