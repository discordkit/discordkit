import { z } from "zod";
import { post, buildURL, type Fetcher, toProcedure } from "../utils";

export const executeGitHubCompatibleWebhookSchema = z.object({
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
 * Add a new webhook to your GitHub repo (in the repo's settings), and use this endpoint as the "Payload URL." You can choose what events your Discord channel receives by choosing the "Let me select individual events" option and selecting individual events for the new webhook you're configuring.
 *
 * https://discord.com/developers/docs/resources/webhook#execute-githubcompatible-webhook
 */
export const executeGitHubCompatibleWebhook: Fetcher<
  typeof executeGitHubCompatibleWebhookSchema
> = async ({ webhook, token, params }) =>
  post(buildURL(`/webhooks/${webhook}/${token}/github`, params).href);

export const executeGitHubCompatibleWebhookProcedure = toProcedure(
  `mutation`,
  executeGitHubCompatibleWebhook,
  executeGitHubCompatibleWebhookSchema
);
