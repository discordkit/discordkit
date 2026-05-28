import * as v from "valibot";
import {
  post,
  buildURL,
  type Fetcher,
  snowflake,
  boundedString
} from "@discordkit/core";

export const executeSlackCompatibleWebhookSchema = v.object({
  webhook: snowflake,
  token: boundedString(),
  params: v.exactOptional(
    v.partial(
      v.object({
        /** id of the thread to send the message in */
        threadId: snowflake,
        /** waits for server confirmation of message send before response (defaults to `true`; when `false` a message that is not saved does not return an error) */
        wait: v.exactOptional(v.boolean())
      })
    )
  )
});

/**
 * ### [Execute Slack-Compatible Webhook](https://discord.com/developers/docs/resources/webhook#execute-slackcompatible-webhook)
 *
 * **POST** `/webhooks/:webhook/:token/slack`
 *
 * Refer to [Slack's documentation](https://api.slack.com/incoming-webhooks) for more information. We do not support Slack's `channel`, `icon_emoji`, `mrkdwn`, or `mrkdwn_in` properties.
 */
export const executeSlackCompatibleWebhook: Fetcher<
  typeof executeSlackCompatibleWebhookSchema,
  void,
  { anonymous: true }
> = async ({ webhook, token, params }, options) =>
  post(
    buildURL(`/webhooks/${webhook}/${token}/slack`, params).href,
    undefined,
    options
  );
