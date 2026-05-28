import * as v from "valibot";
import {
  post,
  type Fetcher,
  snowflake,
  boundedString,
  url
} from "@discordkit/core";
import { type Webhook } from "./types/Webhook.js";

export const createWebhookSchema = v.object({
  channel: snowflake,
  body: v.object({
    /** name of the webhook (1-80 characters) */
    name: boundedString({ max: 80 }),
    /** image for the default webhook avatar */
    avatar: url
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
 * - It follows the nickname guidelines in the [Usernames and Nicknames](https://discord.com/developers/docs/resources/user#usernames-and-nicknames) documentation, with an exception that webhook names can be up to 80 characters
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const createWebhook: Fetcher<
  typeof createWebhookSchema,
  Webhook,
  { auditLogReason: true }
> = async ({ channel, body }, options) =>
  post(`/channels/${channel}/webhooks`, body, options);
