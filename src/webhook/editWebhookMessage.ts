import { z } from "zod";
import { patch, buildURL, type Fetcher, toProcedure } from "../utils";
import { messageSchema, type Message } from "../channel/types/Message";
import { embedSchema } from "../channel/types/Embed";
import { allowedMentionSchema } from "../channel/types/AllowedMention";
import { attachmentSchema } from "../channel/types/Attachment";
import { messageComponentSchema } from "../channel/types/MessageComponent";
import { EmbedType } from "../channel/types/EmbedType";

export const editWebhookMessageSchema = z.object({
  webhook: z.string().min(1),
  token: z.string().min(1),
  message: z.string().min(1),
  params: z
    .object({
      /** id of the thread the message is in */
      threadId: z.string().min(1)
    })
    .partial()
    .optional(),
  body: z
    .object({
      /** the message contents (up to 2000 characters) */
      content: z.string().min(1).max(2000),
      /** embedded `rich` content */
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
      attachments: attachmentSchema.partial().array()
    })
    .partial()
});

/**
 * ### [Edit Webhook Message](https://discord.com/developers/docs/resources/webhook#edit-webhook-message)
 *
 * **PATCH** `/webhooks/:webhook/:token/messages/:message`
 *
 * Edits a previously-sent webhook message from the same token. Returns a {@link Message | message object} on success.
 *
 * When the `content` field is edited, the `mentions` array in the message object will be reconstructed from scratch based on the new content. The `allowedMentions` field of the edit request controls how this happens. If there is no explicit `allowedMentions` in the edit request, the content will be parsed with default allowances, that is, without regard to whether or not an `allowedMentions` was present in the request that originally created the message.
 *
 * Refer to Uploading Files for details on attachments and `multipart/form-data` requests. Any provided files will be **appended** to the message. To remove or replace files you will have to supply the `attachments` field which specifies the files to retain on the message after edit.
 *
 * > **WARNING**
 * >
 * > Starting with API v10, the `attachments` array must contain all attachments that should be present after edit, including **retained and new** attachments provided in the request body.
 *
 * > **NOTE**
 * >
 * > All parameters to this endpoint are optional and nullable.
 */
export const editWebhookMessage: Fetcher<
  typeof editWebhookMessageSchema,
  Message
> = async ({ webhook, token, message, params, body }) =>
  patch(
    buildURL(`/webhooks/${webhook}/${token}/messages/${message}`, params).href,
    body
  );

export const editWebhookMessageProcedure = toProcedure(
  `mutation`,
  editWebhookMessage,
  editWebhookMessageSchema,
  messageSchema
);
