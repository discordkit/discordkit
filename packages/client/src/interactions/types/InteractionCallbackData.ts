import * as v from "valibot";
import { boundedArray, boundedInteger, boundedString } from "@discordkit/core";
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
    content: v.exactOptional(boundedString()),
    /** supports up to 10 embeds */
    embeds: v.exactOptional(boundedArray(embedSchema, { max: 10 })),
    /** allowed mentions object */
    allowedMentions: v.exactOptional(allowedMentionSchema),
    /** message flags combined as a bitfield (only SUPPRESS_EMBEDS and EPHEMERAL can be set) */
    flags: v.exactOptional(boundedInteger()),
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
    choices: boundedArray(applicationCommandOptionChoiceSchema, { max: 25 })
  }),
  /** Modal */
  v.object({
    /** Developer-defined identifier for the modal, max 100 characters */
    customId: boundedString({ max: 100 }),
    /** Title of the popup modal, max 45 characters */
    title: boundedString({ max: 45 }),
    /** Between 1 and 5 (inclusive) components that make up the modal */
    components: boundedArray(componenetSchema, { max: 5 })
  })
]);

export type InteractionCallbackData = v.InferOutput<
  typeof interactionCallbackDataSchema
>;
