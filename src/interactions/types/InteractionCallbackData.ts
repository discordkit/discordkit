import { z } from "zod";
import { allowedMentionSchema } from "../../channel/types/AllowedMention";
import { embedSchema } from "../../channel/types/Embed";
import { messageComponentSchema } from "../../channel/types/MessageComponent";
import { attachmentSchema } from "../../channel";

export const interactionCallbackDataSchema = z.object({
  /** is the response TTS */
  tts: z.boolean().nullable(),
  /** message content */
  content: z.string().nullable(),
  /** supports up to 10 embeds */
  embeds: embedSchema.array().max(10).nullable(),
  /** allowed mentions object */
  allowedMentions: allowedMentionSchema.nullable(),
  /** message flags combined as a bitfield (only SUPPRESS_EMBEDS and EPHEMERAL can be set) */
  flags: z.number().int().nullable(),
  /** message components */
  components: messageComponentSchema.nullable(),
  /** attachment objects with filename and description */
  attachments: attachmentSchema.partial().array().nullable()
});

export type InteractionCallbackData = z.infer<
  typeof interactionCallbackDataSchema
>;
