import {
  type InferOutput,
  array,
  boolean,
  integer,
  maxLength,
  nonEmpty,
  nullish,
  number,
  object,
  partial,
  pipe,
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
  content: nullish(pipe(string(), nonEmpty())),
  /** supports up to 10 embeds */
  embeds: nullish(pipe(array(embedSchema), maxLength(10))),
  /** allowed mentions object */
  allowedMentions: nullish(allowedMentionSchema),
  /** message flags combined as a bitfield (only SUPPRESS_EMBEDS and EPHEMERAL can be set) */
  flags: nullish(pipe(number(), integer())),
  /** message components */
  components: nullish(messageComponentSchema),
  /** attachment objects with filename and description */
  attachments: nullish(array(partial(attachmentSchema)))
});

export type InteractionCallbackData = InferOutput<
  typeof interactionCallbackDataSchema
>;
