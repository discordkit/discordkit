import { z } from "zod";
import { patch, buildURL, type Fetcher, toProcedure } from "../utils";
import { messageSchema, type Message } from "../channel/types/Message";
import { embedSchema } from "../channel/types/Embed";
import { allowedMentionSchema } from "../channel/types/AllowedMention";
import { attachmentSchema } from "../channel/types/Attachment";

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
      content: z.string().min(1).max(200),
      /** embedded rich content */
      embeds: embedSchema.array(),
      /** allowed mentions for the message */
      allowedMentions: allowedMentionSchema,
      /** the components to include with the message */
      components: z.unknown().array(),
      /** the contents of the file being sent */
      files: z.unknown(),
      /** JSON encoded body of non-file params */
      payloadJson: z.unknown(),
      /** attachment objects with filename and description */
      attachments: attachmentSchema.partial().array()
    })
    .partial()
});

/**
 * Edits a previously-sent webhook message from the same token. Returns a message object on success.
 *
 * When the `content` field is edited, the `mentions` array in the message object will be reconstructed from scratch based on the new content. The `allowed_mentions` field of the edit request controls how this happens. If there is no explicit `allowed_mentions` in the edit request, the content will be parsed with default allowances, that is, without regard to whether or not an `allowed_mentions` was present in the request that originally created the message.
 *
 * *Refer to [Uploading Files](https://discord.com/developers/docs/reference#uploading-files) for details on attachments and `multipart/form-data` requests. Any provided files will be appended to the message. To remove or replace files you will have to supply the `attachments` field which specifies the files to retain on the message after edit.*
 *
 * *Starting with API v10, the `attachments` array must contain all attachments that should be present after edit, including **retained and new** attachments provided in the request body.*
 *
 * https://discord.com/developers/docs/resources/webhook#edit-webhook-message
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
