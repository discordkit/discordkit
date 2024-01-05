import {
  type Output,
  array,
  boolean,
  integer,
  maxLength,
  minLength,
  nullish,
  number,
  object,
  partial,
  string
} from "valibot";
import { allowedMentionSchema } from "../../channel/types/AllowedMention.js";
import { embedSchema } from "../../channel/types/Embed.js";
import { messageComponentSchema } from "../../channel/types/MessageComponent.js";
import { attachmentSchema } from "../../channel/types/Attachment.js";

export const interactionCallbackDataSchema = object({
  /** is the response TTS */
  tts: nullish(boolean()),
  /** message content */
  content: nullish(string([minLength(1)])),
  /** supports up to 10 embeds */
  embeds: nullish(array(embedSchema, [maxLength(10)])),
  /** allowed mentions object */
  allowedMentions: nullish(allowedMentionSchema),
  /** message flags combined as a bitfield (only SUPPRESS_EMBEDS and EPHEMERAL can be set) */
  flags: nullish(number([integer()])),
  /** message components */
  components: nullish(messageComponentSchema),
  /** attachment objects with filename and description */
  attachments: nullish(array(partial(attachmentSchema)))
});

export type InteractionCallbackData = Output<
  typeof interactionCallbackDataSchema
>;
