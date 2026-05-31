import * as v from "valibot";
import {
  patch,
  buildURL,
  type Fetcher,
  partial,
  snowflake,
  boundedArray,
  boundedString,
  multipart,
  fileUpload
} from "@discordkit/core";
import { type Message } from "../messages/types/Message.js";
import { embedSchema } from "../messages/types/Embed.js";
import { allowedMentionSchema } from "../messages/types/AllowedMention.js";
import { attachmentSchema } from "../messages/types/Attachment.js";
import { messageComponentSchema } from "../messages/types/MessageComponent.js";
import { EmbedType } from "../messages/types/EmbedType.js";
import { pollSchema } from "../poll/types/Poll.js";

export const editWebhookMessageSchema = v.object({
  webhook: snowflake,
  token: boundedString(),
  message: snowflake,
  params: v.exactOptional(
    v.partial(
      v.object({
        /** id of the thread the message is in */
        threadId: snowflake,
        /** whether to respect the `components` field of the request. When enabled, allows application-owned webhooks to use all components and non-owned webhooks to use non-interactive components. (defaults to `false`) */
        withComponents: v.boolean()
      })
    )
  ),
  body: multipart(
    {
      /** the message contents (up to 2000 characters) */
      content: boundedString({ max: 2000 }),
      /** embedded `rich` content */
      embeds: boundedArray(
        v.object({
          ...embedSchema.entries,
          type: v.literal(EmbedType.RICH)
        }),
        { max: 10 }
      ),
      /** allowed mentions for the message */
      allowedMentions: allowedMentionSchema,
      /** the components to include with the message */
      components: v.array(messageComponentSchema),
      /** the contents of the file being sent */
      files: v.array(fileUpload),
      /** attachment objects with filename and description */
      attachments: v.array(partial(attachmentSchema)),
      /** A poll! */
      poll: pollSchema
    },
    { partial: true }
  )
});

/**
 * ### [Edit Webhook Message](https://discord.com/developers/docs/resources/webhook#edit-webhook-message)
 *
 * **PATCH** `/webhooks/:webhook/:token/messages/:message`
 *
 * Edits a previously-sent webhook message from the same token. Returns a {@link Message | message object} on success.
 *
 * When the `content` field is edited, the arrays `mentions` and `mention_roles` and the boolean `mention_everyone` in the {@link Message | message object} will be reconstructed from scratch based on the new content. When the message flag `IS_COMPONENTS_V2` is set, the reconstructed arrays and boolean are based on the edited content in the `components` array. The `allowed_mentions` field of the edit request controls how this happens. If there is no explicit `allowed_mentions` in the edit request, the content will be parsed with *default* allowances, that is, without regard to whether or not an `allowed_mentions` was present in the request that originally created the message.
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
  Message,
  { anonymous: true }
> = async ({ webhook, token, message, params, body }, options) =>
  patch(
    buildURL(`/webhooks/${webhook}/${token}/messages/${message}`, params).href,
    body,
    options
  );
