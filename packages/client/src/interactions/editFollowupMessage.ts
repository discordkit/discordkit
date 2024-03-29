import { z } from "zod";
import {
  patch,
  buildURL,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { messageSchema, type Message } from "../channel/types/Message.js";
import { embedSchema } from "../channel/types/Embed.js";
import { allowedMentionSchema } from "../channel/types/AllowedMention.js";
import { attachmentSchema } from "../channel/types/Attachment.js";
import { messageComponentSchema } from "../channel/types/MessageComponent.js";
import { EmbedType } from "../channel/types/EmbedType.js";

export const editFollowupMessageSchema = z.object({
  application: snowflake,
  token: z.string().min(1),
  message: snowflake,
  params: z
    .object({
      /** id of the thread the message is in */
      threadId: snowflake
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
 * ### [Edit Followup Message](https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message)
 *
 * **PATCH** `/webhooks/:application/:token/messages/:message`
 *
 * Edits a followup message for an Interaction. Functions the same as Edit Webhook Message.
 */
export const editFollowupMessage: Fetcher<
  typeof editFollowupMessageSchema,
  Message
> = async ({ application, token, message, params, body }) =>
  patch(
    buildURL(`/webhooks/${application}/${token}/messages/${message}`, params)
      .href,
    body
  );

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
