import { z } from "zod";
import { allowedMentionSchema } from "../../channel/types/AllowedMention.js";
import { embedSchema } from "../../channel/types/Embed.js";
import { messageComponentSchema } from "../../channel/types/MessageComponent.js";
import { attachmentSchema } from "../../channel/types/Attachment.js";

export const interactionCallbackDataSchema = z.object({
  /** is the response TTS */
  tts: z.boolean().nullish(),
  /** message content */
  content: z.string().nullish(),
  /** supports up to 10 embeds */
  embeds: embedSchema.array().max(10).nullish(),
  /** allowed mentions object */
  allowedMentions: allowedMentionSchema.nullish(),
  /** message flags combined as a bitfield (only SUPPRESS_EMBEDS and EPHEMERAL can be set) */
  flags: z.number().int().nullish(),
  /** message components */
  components: messageComponentSchema.nullish(),
  /** attachment objects with filename and description */
  attachments: attachmentSchema.partial().array().nullish()
});

export type InteractionCallbackData = z.infer<
  typeof interactionCallbackDataSchema
>;
