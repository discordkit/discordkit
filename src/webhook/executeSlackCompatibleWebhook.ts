import { z } from "zod";
import { post, buildURL, type Fetcher, toProcedure } from "../utils";

export const executeSlackCompatibleWebhookSchema = z.object({
  webhook: z.string().min(1),
  token: z.string().min(1),
  params: z
    .object({
      /** id of the thread to send the message in */
      threadId: z.string(),
      /** waits for server confirmation of message send before response (defaults to `true`; when `false` a message that is not saved does not return an error) */
      wait: z.boolean().default(true)
    })
    .partial()
    .optional()
});

/**
 * ### [Execute Slack-Compatible Webhook](https://discord.com/developers/docs/resources/webhook#execute-slackcompatible-webhook)
 *
 * **POST** `/webhooks/:webhook/:token/slack`
 *
 * Refer to [Slack's documentation](https://api.slack.com/incoming-webhooks) for more information. We do not support Slack's `channel`, `icon_emoji`, `mrkdwn`, or `mrkdwn_in` properties.
 */
export const executeSlackCompatibleWebhook: Fetcher<
  typeof executeSlackCompatibleWebhookSchema
> = async ({ webhook, token, params }) =>
  post(buildURL(`/webhooks/${webhook}/${token}/slack`, params).href);

export const executeSlackCompatibleWebhookProcedure = toProcedure(
  `mutation`,
  executeSlackCompatibleWebhook,
  executeSlackCompatibleWebhookSchema
);
