import { z } from "zod";
import { patch, buildURL, type Fetcher, toProcedure } from "../utils";
import { embedSchema } from "../channel/types/Embed";
import { allowedMentionSchema } from "../channel/types/AllowedMention";
import { attachmentSchema } from "../channel/types/Attachment";
import { messageComponentSchema } from "../channel/types/MessageComponent";
import { EmbedType } from "../channel/types/EmbedType";
import {
  type InteractionResponse,
  interactionResponseSchema
} from "./types/InteractionResponse";

export const editOriginalInteractionResponseSchema = z.object({
  application: z.string().min(1),
  token: z.string().min(1),
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
 * ### [Edit Original Interaction Response](https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response)
 *
 * **PATCH** `/webhooks/:application/:token/messages/@original`
 *
 * Edits the initial {@link InteractionReponse Interaction response}.. Functions the same as Edit Webhook Message.
 */
export const editOriginalInteractionResponse: Fetcher<
  typeof editOriginalInteractionResponseSchema,
  InteractionResponse
> = async ({ application, token, params, body }) =>
  patch(
    buildURL(`/webhooks/${application}/${token}/messages/@original`, params)
      .href,
    body
  );

export const editOriginalInteractionResponseProcedure = toProcedure(
  `mutation`,
  editOriginalInteractionResponse,
  editOriginalInteractionResponseSchema,
  interactionResponseSchema
);
