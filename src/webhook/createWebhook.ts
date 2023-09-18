import { z } from "zod";
import { post, type Fetcher } from "../utils";
import type { Webhook } from "./types";

export const createWebhookConfig = z.object({
  channel: z.string().min(1),
  body: z.object({
    /** name of the webhook (1-80 characters) */
    name: z.string().min(1).max(80),
    /** image for the default webhook avatar */
    avatar: z.string().optional()
  })
});

/**
 * **POST** `/channels/{channel.id}/webhooks`
 *
 * Creates a new webhook and returns a webhook object on success. Requires the `MANAGE_WEBHOOKS` permission. Fires a Webhooks Update Gateway event.
 *
 * An error will be returned if a webhook name (`name`) is not valid. A webhook name is valid if:
 *
 * - It does not contain the substrings `clyde` or `discord` (case-insensitive)
 * - It follows the nickname guidelines in the [Usernames and Nicknames](https://discord.com/developers/docs/resources/user#usernames-and-nicknames) documentation, with an exception that webhook names can be up to 80 characters
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 *
 * https://discord.com/developers/docs/resources/webhook#create-webhook
 */
export const createWebhook: Fetcher<
  typeof createWebhookConfig,
  Webhook
> = async ({ channel, body }) => post(`/channels/${channel}/webhooks`, body);
