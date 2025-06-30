import {
  type InferOutput,
  array,
  boolean,
  exactOptional,
  integer,
  maxLength,
  nonEmpty,
  number,
  object,
  partial,
  pipe,
  string,
  union
} from "valibot";
import { allowedMentionSchema } from "../../messages/types/AllowedMention.js";
import { embedSchema } from "../../messages/types/Embed.js";
import { messageComponentSchema } from "../../messages/types/MessageComponent.js";
import { attachmentSchema } from "../../messages/types/Attachment.js";
import { pollCreateRequestSchema } from "../../poll/types/PollCreateRequest.js";
import { applicationCommandOptionChoiceSchema } from "../../application-commands/types/ApplicationCommandOptionChoice.js";
import { componenetSchema } from "../../components/types/Component.js";

export const interactionCallbackDataSchema = union([
  /** Messages */
  object({
    /** is the response TTS */
    tts: exactOptional(boolean()),
    /** message content */
    content: exactOptional(pipe(string(), nonEmpty())),
    /** supports up to 10 embeds */
    embeds: exactOptional(pipe(array(embedSchema), maxLength(10))),
    /** allowed mentions object */
    allowedMentions: exactOptional(allowedMentionSchema),
    /** message flags combined as a bitfield (only SUPPRESS_EMBEDS and EPHEMERAL can be set) */
    flags: exactOptional(pipe(number(), integer())),
    /** message components */
    components: exactOptional(messageComponentSchema),
    /** attachment objects with filename and description */
    attachments: exactOptional(array(partial(attachmentSchema))),
    /** Details about the poll */
    poll: exactOptional(pollCreateRequestSchema)
  }),
  /** Autocomplete */
  object({
    /** autocomplete choices (max of 25 choices) */
    choices: pipe(array(applicationCommandOptionChoiceSchema), maxLength(25))
  }),
  /** Modal */
  object({
    /** Developer-defined identifier for the modal, max 100 characters */
    customId: pipe(string(), nonEmpty(), maxLength(100)),
    /** Title of the popup modal, max 45 characters */
    title: pipe(string(), nonEmpty(), maxLength(45)),
    /** Between 1 and 5 (inclusive) components that make up the modal */
    components: pipe(array(componenetSchema), nonEmpty(), maxLength(5))
  })
]);

export type InteractionCallbackData = InferOutput<
  typeof interactionCallbackDataSchema
>;
