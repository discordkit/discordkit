import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  boundedString,
  boundedArray
} from "@discordkit/core";
import { messageSchema, type Message } from "../messages/types/Message.js";
import { embedSchema } from "../messages/types/Embed.js";
import { allowedMentionSchema } from "../messages/types/AllowedMention.js";
import { attachmentSchema } from "../messages/types/Attachment.js";
import { messageComponentSchema } from "../messages/types/MessageComponent.js";
import { EmbedType } from "../messages/types/EmbedType.js";

export const editFollowupMessageSchema = v.object({
  application: snowflake,
  token: v.pipe(v.string(), v.nonEmpty()),
  message: snowflake,
  body: v.partial(
    v.object({
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
      files: v.array(v.unknown()),
      /** attachment objects with filename and description */
      attachments: v.array(v.partial(attachmentSchema))
    })
  )
});

/**
 * ### [Edit Followup Message](https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message)
 *
 * **PATCH** `/webhooks/:application/:token/messages/:message`
 *
 * Edits a followup message for an Interaction. Functions the same as Edit Webhook Message.
 */
export const editFollowupMessage: Fetcher<
  typeof editFollowupMessageSchema,
  Message
> = async ({ application, token, message, body }) =>
  patch(`/webhooks/${application}/${token}/messages/${message}`, body);

export const editFollowupMessageSafe = toValidated(
  editFollowupMessage,
  editFollowupMessageSchema,
  messageSchema
);

export const editFollowupMessageProcedure = toProcedure(
  `mutation`,
  editFollowupMessage,
  editFollowupMessageSchema,
  messageSchema
);
