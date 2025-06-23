import {
  object,
  string,
  minLength,
  maxLength,
  url,
  nullish,
  pipe
} from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { webhookSchema, type Webhook } from "./types/Webhook.js";

export const createWebhookSchema = object({
  channel: snowflake,
  body: object({
    /** name of the webhook (1-80 characters) */
    name: pipe(string(), minLength(1), maxLength(80)),
    /** image for the default webhook avatar */
    avatar: nullish(pipe(string(), url()))
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
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const createWebhook: Fetcher<
  typeof createWebhookSchema,
  Webhook
> = async ({ channel, body }) => post(`/channels/${channel}/webhooks`, body);

export const createWebhookSafe = toValidated(
  createWebhook,
  createWebhookSchema,
  webhookSchema
);

export const createWebhookProcedure = toProcedure(
  `mutation`,
  createWebhook,
  createWebhookSchema,
  webhookSchema
);
