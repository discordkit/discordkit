import { z } from "zod";
import { mutation, post, buildURL } from "../utils";

export const executeSlackCompatibleWebhookSchema = z.object({
  webhook: z.string().min(1),
  token: z.string().min(1),
  params: z
    .object({
      /** waits for server confirmation of message send before response, and returns the created message body (defaults to false; when false a message that is not saved does not return an error) (default: false) */
      wait: z.boolean(),
      /** Send a message to the specified thread within a webhook's channel. The thread will automatically be unarchived.	(default: undefined) */
      threadId: z.string()
    })
    .partial()
    .optional()
});

/**
 * Refer to [Slack's documentation](https://api.slack.com/incoming-webhooks) for more information. We do not support Slack's `channel`, `icon_emoji`, `mrkdwn`, or `mrkdwn_in` properties.
 *
 * https://discord.com/developers/docs/resources/webhook#execute-slackcompatible-webhook
 */
export const executeSlackCompatibleWebhook = mutation(
  executeSlackCompatibleWebhookSchema,
  async ({ webhook, token, params }) => post(buildURL(`/webhooks/${webhook}/${token}/slack`, params).href)
);
