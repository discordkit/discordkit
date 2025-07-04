import * as v from "valibot";
import {
  patch,
  buildURL,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  boundedString,
  boundedArray
} from "@discordkit/core";
import { embedSchema } from "../messages/types/Embed.js";
import { allowedMentionSchema } from "../messages/types/AllowedMention.js";
import { attachmentSchema } from "../messages/types/Attachment.js";
import { messageComponentSchema } from "../messages/types/MessageComponent.js";
import { EmbedType } from "../messages/types/EmbedType.js";
import {
  type InteractionCallbackResponse,
  interactionCallbackResponseSchema
} from "./types/InteractionCallbackResponse.js";

export const editOriginalInteractionResponseSchema = v.object({
  application: snowflake,
  token: boundedString(),
  params: v.exactOptional(
    v.partial(
      v.object({
        /** id of the thread the message is in */
        threadId: snowflake
      })
    )
  ),
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
 * ### [Edit Original Interaction Response](https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response)
 *
 * **PATCH** `/webhooks/:application/:token/messages/@original`
 *
 * Edits the initial {@link InteractionCallbackReponse Interaction response}.. Functions the same as Edit Webhook Message.
 */
export const editOriginalInteractionResponse: Fetcher<
  typeof editOriginalInteractionResponseSchema,
  InteractionCallbackResponse
> = async ({ application, token, params, body }) =>
  patch(
    buildURL(`/webhooks/${application}/${token}/messages/@original`, params)
      .href,
    body
  );

export const editOriginalInteractionResponseSafe = toValidated(
  editOriginalInteractionResponse,
  editOriginalInteractionResponseSchema,
  interactionCallbackResponseSchema
);

export const editOriginalInteractionResponseProcedure = toProcedure(
  `mutation`,
  editOriginalInteractionResponse,
  editOriginalInteractionResponseSchema,
  interactionCallbackResponseSchema
);
