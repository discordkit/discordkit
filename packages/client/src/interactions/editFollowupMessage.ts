import * as v from "valibot";
import { patch, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedArray } from "@discordkit/core/validations/boundedArray";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { multipart, fileUpload } from "@discordkit/core/validations/fileUpload";
import { partialSchema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { Message } from "../messages/types/Message.js";
import { embedEntries } from "../messages/types/Embed.js";
import { allowedMentionSchema } from "../messages/types/AllowedMention.js";
import { attachmentSchema } from "../messages/types/Attachment.js";
import { messageComponentSchema } from "../messages/types/MessageComponent.js";
import { EmbedType } from "../messages/types/EmbedType.js";

export const editFollowupMessageSchema = v.object({
  application: snowflake,
  token: v.pipe(v.string(), v.nonEmpty()),
  message: snowflake,
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
 * ### [Edit Followup Message](https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message)
 *
 * **PATCH** `/webhooks/:application/:token/messages/:message`
 *
 * Edits a followup message for an Interaction. Functions the same as Edit Webhook Message.
 */
export const editFollowupMessage: Fetcher<
  typeof editFollowupMessageSchema,
  Message,
  { anonymous: true }
> = async ({ application, token, message, body }, options) =>
  patch(`/webhooks/${application}/${token}/messages/${message}`, body, options);
