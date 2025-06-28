import {
  array,
  literal,
  maxLength,
  minLength,
  nonEmpty,
  object,
  exactOptional,
  partial,
  pipe,
  string,
  unknown
} from "valibot";
import {
  patch,
  buildURL,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { embedSchema } from "../messages/types/Embed.js";
import { allowedMentionSchema } from "../messages/types/AllowedMention.js";
import { attachmentSchema } from "../messages/types/Attachment.js";
import { messageComponentSchema } from "../messages/types/MessageComponent.js";
import { EmbedType } from "../messages/types/EmbedType.js";
import {
  type InteractionResponse,
  interactionResponseSchema
} from "./types/InteractionResponse.js";

export const editOriginalInteractionResponseSchema = object({
  application: snowflake,
  token: pipe(string(), nonEmpty()),
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

export const editOriginalInteractionResponseSafe = toValidated(
  editOriginalInteractionResponse,
  editOriginalInteractionResponseSchema,
  interactionResponseSchema
);

export const editOriginalInteractionResponseProcedure = toProcedure(
  `mutation`,
  editOriginalInteractionResponse,
  editOriginalInteractionResponseSchema,
  interactionResponseSchema
);
