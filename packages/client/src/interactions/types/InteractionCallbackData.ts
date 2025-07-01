import * as v from "valibot";
import { allowedMentionSchema } from "../../messages/types/AllowedMention.js";
import { embedSchema } from "../../messages/types/Embed.js";
import { messageComponentSchema } from "../../messages/types/MessageComponent.js";
import { attachmentSchema } from "../../messages/types/Attachment.js";
import { pollCreateRequestSchema } from "../../poll/types/PollCreateRequest.js";
import { applicationCommandOptionChoiceSchema } from "../../application-commands/types/ApplicationCommandOptionChoice.js";
import { componenetSchema } from "../../components/types/Component.js";

export const interactionCallbackDataSchema = v.union([
  /** Messages */
  v.object({
    /** is the response TTS */
    tts: v.exactOptional(v.boolean()),
    /** message content */
    content: v.exactOptional(v.pipe(v.string(), v.nonEmpty())),
    /** supports up to 10 embeds */
    embeds: v.exactOptional(v.pipe(v.array(embedSchema), v.maxLength(10))),
    /** allowed mentions object */
    allowedMentions: v.exactOptional(allowedMentionSchema),
    /** message flags combined as a bitfield (only SUPPRESS_EMBEDS and EPHEMERAL can be set) */
    flags: v.exactOptional(v.pipe(v.number(), v.integer())),
    /** message components */
    components: v.exactOptional(messageComponentSchema),
    /** attachment objects with filename and description */
    attachments: v.exactOptional(v.array(v.partial(attachmentSchema))),
    /** Details about the poll */
    poll: v.exactOptional(pollCreateRequestSchema)
  }),
  /** Autocomplete */
  v.object({
    /** autocomplete choices (max of 25 choices) */
    choices: v.pipe(
      v.array(applicationCommandOptionChoiceSchema),
      v.maxLength(25)
    )
  }),
  /** Modal */
  v.object({
    /** Developer-defined identifier for the modal, max 100 characters */
    customId: v.pipe(v.string(), v.nonEmpty(), v.maxLength(100)),
    /** Title of the popup modal, max 45 characters */
    title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(45)),
    /** Between 1 and 5 (inclusive) components that make up the modal */
    components: v.pipe(v.array(componenetSchema), v.nonEmpty(), v.maxLength(5))
  })
]);

export type InteractionCallbackData = v.InferOutput<
  typeof interactionCallbackDataSchema
>;
