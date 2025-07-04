import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  asInteger,
  boundedArray,
  boundedString
} from "@discordkit/core";
import { type Message, messageSchema } from "./types/Message.js";
import { embedSchema } from "./types/Embed.js";
import { allowedMentionSchema } from "./types/AllowedMention.js";
import { messageComponentSchema } from "./types/MessageComponent.js";
import { attachmentSchema } from "./types/Attachment.js";
import { messageFlag } from "./types/MessageFlag.js";

export const editMessageSchema = v.object({
  channel: snowflake,
  message: snowflake,
  body: v.partial(
    v.object({
      /** Message contents (up to 2000 characters) */
      content: boundedString({ max: 2000 }),
      /** Up to 10 rich embeds (up to 6000 characters) */
      embeds: boundedArray(embedSchema, { max: 10 }),
      /** Edit the flags of a message (only SUPPRESS_EMBEDS can currently be set/unset) */
      flags: asInteger(messageFlag),
      /** Allowed mentions for the message */
      allowedMentions: allowedMentionSchema,
      /** Components to include with the message */
      components: messageComponentSchema,
      /** Contents of the file being sent/edited. See Uploading Files */
      files: v.array(v.unknown()),
      /** Attached files to keep and possible descriptions for new files. See Uploading Files */
      attachments: v.array(attachmentSchema)
    })
  )
});

/**
 * ### [Edit Message](https://discord.com/developers/docs/resources/channel#edit-message)
 *
 * **PATCH** `/channels/:channel/messages/:message`
 *
 * Edit a previously sent message. The fields `content`, `embeds`, and `flags` can be edited by the original message author. Other users can only edit `flags` and only if they have the `MANAGE_MESSAGES` permission in the corresponding channel. When specifying flags, ensure to include all previously set flags/bits in addition to ones that you are modifying. Only `flags` documented in the table below may be modified by users (unsupported flag changes are currently ignored without error).
 *
 * When the `content` field is edited, the `mentions` array in the message object will be reconstructed from scratch based on the new content. The `allowedMentions` field of the edit request controls how this happens. If there is no explicit `allowedMentions` in the edit request, the content will be parsed with default allowances, that is, without regard to whether or not an `allowedMentions` was present in the request that originally created the message.
 *
 * Returns a {@link Message | message object}. Fires a Message Update Gateway event.
 *
 * Refer to Uploading Files for details on attachments and `multipart/form-data` requests. Any provided files will be appended to the message. To remove or replace files you will have to supply the `attachments` field which specifies the files to retain on the message after edit.
 *
 * > [!WARNING]
 * >
 * > Starting with API v10, the `attachments` array must contain all attachments that should be present after edit, including **retained and new** attachments provided in the request body.
 *
 * > [!NOTE]
 * >
 * > All parameters to this endpoint are optional and nullable.
 */
export const editMessage: Fetcher<typeof editMessageSchema, Message> = async ({
  channel,
  message,
  body
}) => patch(`/channels/${channel}/messages/${message}`, body);

export const editMessageSafe = toValidated(
  editMessage,
  editMessageSchema,
  messageSchema
);

export const editMessageProcedure = toProcedure(
  `mutation`,
  editMessage,
  editMessageSchema,
  messageSchema
);
