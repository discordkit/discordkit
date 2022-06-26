import { z } from "zod";
import { post, mutation } from "../utils";
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
 * Creates a new webhook and returns a webhook object on success. Requires the `MANAGE_WEBHOOKS` permission.
 *
 * An error will be returned if a webhook name (`name`) is not valid. A webhook name is valid if:
 *
 * - It does not contain the substring '**clyde**' (case-insensitive)
 * - It follows the nickname guidelines in the [Usernames and Nicknames](https://discord.com/developers/docs/resources/user#usernames-and-nicknames) documentation, with an exception that webhook names can be up to 80 characters
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 */
export const createWebhook = mutation(createWebhookConfig, async ({ channel, body }) =>
  post<Webhook>(`/channels/${channel}/webhooks`, body)
);
