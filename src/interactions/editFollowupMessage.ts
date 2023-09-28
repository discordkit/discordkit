import { z } from "zod";
import { patch, buildURL, type Fetcher, toProcedure } from "#/utils/index.ts";
import { messageSchema, type Message } from "#/channel/types/Message.ts";
import { embedSchema } from "#/channel/types/Embed.ts";
import { allowedMentionSchema } from "#/channel/types/AllowedMention.ts";
import { attachmentSchema } from "#/channel/types/Attachment.ts";
import { messageComponentSchema } from "#/channel/types/MessageComponent.ts";
import { EmbedType } from "#/channel/types/EmbedType.ts";

export const editFollowupMessageSchema = z.object({
  application: z.string().min(1),
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

export const editFollowupMessageProcedure = toProcedure(
  `mutation`,
  editFollowupMessage,
  editFollowupMessageSchema,
  messageSchema
);
