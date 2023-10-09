import { object, string, minLength, boolean, partial, optional } from "valibot";
import {
  post,
  buildURL,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const executeGitHubCompatibleWebhookSchema = object({
  webhook: snowflake,
  token: string([minLength(1)]),
  params: optional(
    partial(
      object({
        /** id of the thread to send the message in */
        threadId: snowflake,
        /** waits for server confirmation of message send before response (defaults to `true`; when `false` a message that is not saved does not return an error) */
        wait: optional(boolean(), true)
      })
    )
  )
});

/**
 * ### [Execute GitHub-Compatible Webhook](https://discord.com/developers/docs/resources/webhook#execute-githubcompatible-webhook)
 *
 * **POST** `/webhooks/:webhook/:token/github`
 *
 * Add a new webhook to your GitHub repo (in the repo's settings), and use this endpoint as the "Payload URL." You can choose what events your Discord channel receives by choosing the "Let me select individual events" option and selecting individual events for the new webhook you're configuring.
 */
export const executeGitHubCompatibleWebhook: Fetcher<
  typeof executeGitHubCompatibleWebhookSchema
> = async ({ webhook, token, params }) =>
  post(buildURL(`/webhooks/${webhook}/${token}/github`, params).href);

export const executeGitHubCompatibleWebhookSafe = toValidated(
  executeGitHubCompatibleWebhook,
  executeGitHubCompatibleWebhookSchema
);

export const executeGitHubCompatibleWebhookProcedure = toProcedure(
  `mutation`,
  executeGitHubCompatibleWebhook,
  executeGitHubCompatibleWebhookSchema
);
