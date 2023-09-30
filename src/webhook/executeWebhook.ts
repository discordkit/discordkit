import { z } from "zod";
import {
  post,
  buildURL,
  type Fetcher,
  toProcedure,
  toValidated
} from "#/utils/index.ts";
import { messageFlagSchema } from "#/channel/types/MessageFlag.ts";
import { embedSchema } from "#/channel/types/Embed.ts";
import { allowedMentionSchema } from "#/channel/types/AllowedMention.ts";
import { attachmentSchema } from "#/channel/types/Attachment.ts";
import { EmbedType } from "#/channel/types/EmbedType.ts";
import { messageComponentSchema } from "#/channel/types/MessageComponent.ts";

export const executeWebhookSchema = z.object({
  webhook: z.string().min(1),
  token: z.string().min(1),
  params: z
    .object({
      /** waits for server confirmation of message send before response, and returns the created message body (defaults to false; when false a message that is not saved does not return an error) */
      wait: z.boolean().default(false),
      /** Send a message to the specified thread within a webhook's channel. The thread will automatically be unarchived. */
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
      embeds: embedSchema
        .extend({ type: z.literal(EmbedType.RICH) })
        .array()
        .max(10),
      /** allowed mentions for the message */
      allowedMentions: allowedMentionSchema,
      /** the components to include with the message */
      components: messageComponentSchema.array(),
      /** the contents of the file being sent */
      files: z.unknown().array(),
      /** attachment objects with filename and description */
      attachments: attachmentSchema.partial().array(),
      /** message flags combined as a bitfield (only SUPPRESS_EMBEDS can be set) */
      flags: messageFlagSchema,
      /** name of thread to create (requires the webhook channel to be a forum channel) */
      threadName: z.string().min(1)
    })
    .partial()
});

/**
 * ### [Execute Webhook](https://discord.com/developers/docs/resources/webhook#execute-webhook)
 *
 * **POST** `/webhooks/:webhook/:token`
 *
 * Refer to Uploading Files for details on attachments and `multipart/form-data` requests. Returns a message or `204 No Content` depending on the `wait` query parameter.
 *
 * > **NOTE**
 * >
 * > Note that when sending a message, you must provide a value for at least one of `content`, `embeds`, `components`, or `file`.
 *
 * > **NOTE**
 * >
 * > If the webhook channel is a forum channel, you must provide either `threadId` in the query string params, or `threadName` in the JSON/form params. If `threadId` is provided, the message will send in that thread. If `threadName` is provided, a thread with that name will be created in the forum channel.
 *
 * > **WARNING**
 * >
 * > Discord may strip certain characters from message content, like invalid unicode characters or characters which cause unexpected message formatting. If you are passing user-generated strings into message content, consider sanitizing the data to prevent unexpected behavior and using `allowed_mentions` to prevent unexpected mentions.
 */
export const executeWebhook: Fetcher<typeof executeWebhookSchema> = async ({
  webhook,
  token,
  params,
  body
}) => post(buildURL(`/webhooks/${webhook}/${token}`, params).href, body);

export const executeWebhookSafe = toValidated(
  executeWebhook,
  executeWebhookSchema
);

export const executeWebhookProcedure = toProcedure(
  `mutation`,
  executeWebhook,
  executeWebhookSchema
);
