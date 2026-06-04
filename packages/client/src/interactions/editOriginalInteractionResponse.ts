import * as v from "valibot";
import { buildURL } from "@discordkit/core/requests/buildURL";
import { patch, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedArray } from "@discordkit/core/validations/boundedArray";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { multipart, fileUpload } from "@discordkit/core/validations/fileUpload";
import { partialSchema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { embedEntries } from "../messages/types/Embed.js";
import { allowedMentionSchema } from "../messages/types/AllowedMention.js";
import { attachmentSchema } from "../messages/types/Attachment.js";
import { messageComponentSchema } from "../messages/types/MessageComponent.js";
import { EmbedType } from "../messages/types/EmbedType.js";
import { type InteractionCallbackResponse } from "./types/InteractionCallbackResponse.js";

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
  body: multipart(
    {
      /** the message contents (up to 2000 characters) */
      content: boundedString({ max: 2000 }),
      /** embedded `rich` content */
      embeds: boundedArray(
        v.object({
          ...embedEntries,
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
      attachments: v.array(partialSchema(attachmentSchema))
    },
    { partial: true }
  )
});

/**
 * ### [Edit Original Interaction Response](https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response)
 *
 * **PATCH** `/webhooks/:application/:token/messages/@original`
 *
 * Edits the initial {@link InteractionCallbackResponse | Interaction response}. Functions the same as Edit Webhook Message.
 */
export const editOriginalInteractionResponse: Fetcher<
  typeof editOriginalInteractionResponseSchema,
  InteractionCallbackResponse,
  { anonymous: true }
> = async ({ application, token, params, body }, options) =>
  patch(
    buildURL(`/webhooks/${application}/${token}/messages/@original`, params)
      .href,
    body,
    options
  );
