import { z } from "zod";
import { post, buildURL, type Fetcher } from "../utils";
import { allowedMention, attachment, embed, messageFlag } from "../channel";

export const executeWebhookSchema = z.object({
  webhook: z.string().min(1),
  token: z.string().min(1),
  params: z
    .object({
      /** waits for server confirmation of message send before response, and returns the created message body (defaults to false; when false a message that is not saved does not return an error) (default: false) */
      wait: z.boolean(),
      /** Send a message to the specified thread within a webhook's channel. The thread will automatically be unarchived.	(default: undefined) */
      threadId: z.string().min(1)
    })
    .partial()
    .optional(),
  body: z
    .object({
      /** the message contents (up to 2000 characters) */
      content: z.string().min(1).max(2000),
      /** override the default username of the webhook */
      username: z.string().min(1),
      /** override the default avatar of the webhook */
      avatarUrl: z.string().min(1),
      /** true if this is a TTS message */
      tts: z.boolean(),
      /** embedded rich content */
      embeds: embed.array(),
      /** allowed mentions for the message */
      allowedMentions: allowedMention,
      /** the components to include with the message */
      // components?: MessageComponent[];
      /** the contents of the file being sent */
      // files?: FileContent;
      /** JSON encoded body of non-file params */
      payloadJson: z.string(),
      /** attachment objects with filename and description */
      attachments: attachment.partial().array(),
      /** message flags combined as a bitfield (only SUPPRESS_EMBEDS can be set) */
      flags: messageFlag,
      /** name of thread to create (requires the webhook channel to be a forum channel) */
      threadName: z.string().min(1)
    })
    .partial()
});

/**
 * Refer to Uploading Files for details on attachments and `multipart/form-data` requests. Returns a message or `204 No Content` depending on the `wait` query parameter.
 *
 * *Note that when sending a message, you must provide a value for at **least one of** `content`, `embeds`, or `file`.*
 *
 * *If the webhook channel is a forum channel, you must provide either `thread_id` in the query string params, or `thread_name` in the JSON/form params. If `thread_id` is provided, the message will send in that thread. If `thread_name` is provided, a thread with that name will be created in the forum channel.*
 *
 * https://discord.com/developers/docs/resources/webhook#execute-webhook
 */
export const executeWebhook: Fetcher<typeof executeWebhookSchema> = async ({
  webhook,
  token,
  params,
  body
}) => post(buildURL(`/webhooks/${webhook}/${token}`, params).href, body);
