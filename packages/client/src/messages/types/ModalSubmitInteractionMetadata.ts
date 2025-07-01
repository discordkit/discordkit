import { snowflake } from "@discordkit/core";
import type { GenericSchema, InferOutput } from "valibot";
import {
  object,
  record,
  picklist,
  union,
  literal,
  exactOptional
} from "valibot";
import { interactionTypeSchema } from "../../interactions/types/InteractionType.js";
import { userSchema } from "../../user/types/User.js";
import { applicationCommandInteractionMetadataSchea } from "./ApplicationCommandInteractionMetadata.js";
import { messageComponentInteractionMetadataSchema } from "./MessageComponentInteractionMetadata.js";

export const modalSubmitInteractionMetadataSchema = object({
  /** ID of the interaction */
  id: snowflake as GenericSchema<string>,
  /** Type of interaction */
  type: interactionTypeSchema,
  /** User who triggered the interaction */
  user: userSchema,
  /** IDs for installation context(s) related to an interaction. Details in Authorizing Integration Owners Object */
  authoringIntegrationOwners: record(
    picklist([`GUILD_INSTALL`, `USER_INSTALL`]),
    union([snowflake as GenericSchema<string>, literal(0)])
  ),
  /** ID of the original response message, present only on follow-up messages */
  originalResponseMessageId: exactOptional<GenericSchema<string>>(snowflake),
  /** Metadata for the interaction that was used to open the modal */
  triggeringInteractionMetadata: union([
    applicationCommandInteractionMetadataSchea,
    messageComponentInteractionMetadataSchema
  ])
});

export interface ModalSubmitInteractionMetadata
  extends InferOutput<typeof modalSubmitInteractionMetadataSchema> {}
