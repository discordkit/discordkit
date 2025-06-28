import {
  object,
  string,
  minLength,
  partial,
  exactOptional,
  maxLength,
  array,
  literal,
  unknown,
  pipe
} from "valibot";
import {
  patch,
  buildURL,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { messageSchema, type Message } from "../messages/types/Message.js";
import { embedSchema } from "../messages/types/Embed.js";
import { allowedMentionSchema } from "../messages/types/AllowedMention.js";
import { attachmentSchema } from "../messages/types/Attachment.js";
import { messageComponentSchema } from "../messages/types/MessageComponent.js";
import { EmbedType } from "../messages/types/EmbedType.js";

export const editWebhookMessageSchema = object({
  webhook: snowflake,
  token: pipe(string(), minLength(1)),
  message: snowflake,
  params: exactOptional(
    partial(
      object({
        /** id of the thread the message is in */
        threadId: snowflake
      })
    )
  ),
  body: partial(
    object({
      /** the message contents (up to 2000 characters) */
      content: pipe(string(), minLength(1), maxLength(2000)),
      /** embedded `rich` content */
      embeds: pipe(
        array(
          object({
            ...embedSchema.entries,
            type: literal(EmbedType.RICH)
          })
        ),
        maxLength(10)
      ),
      /** allowed mentions for the message */
      allowedMentions: allowedMentionSchema,
      /** the components to include with the message */
      components: array(messageComponentSchema),
      /** the contents of the file being sent */
      files: array(unknown()),
      /** attachment objects with filename and description */
      attachments: array(partial(attachmentSchema))
    })
  )
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
 * > [!WARNING]
 * >
 * > Starting with API v10, the `attachments` array must contain all attachments that should be present after edit, including **retained and new** attachments provided in the request body.
 *
 * > [!NOTE]
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

export const editWebhookMessageSafe = toValidated(
  editWebhookMessage,
  editWebhookMessageSchema,
  messageSchema
);

export const editWebhookMessageProcedure = toProcedure(
  `mutation`,
  editWebhookMessage,
  editWebhookMessageSchema,
  messageSchema
);
