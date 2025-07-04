import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { interactionTypeSchema } from "../../interactions/types/InteractionType.js";
import { userSchema } from "../../user/types/User.js";
import { applicationCommandInteractionMetadataSchea } from "./ApplicationCommandInteractionMetadata.js";
import { messageComponentInteractionMetadataSchema } from "./MessageComponentInteractionMetadata.js";

export const modalSubmitInteractionMetadataSchema = v.object({
  /** ID of the interaction */
  id: snowflake as v.GenericSchema<string>,
  /** Type of interaction */
  type: interactionTypeSchema,
  /** User who triggered the interaction */
  user: userSchema,
  /** IDs for installation context(s) related to an interaction. Details in Authorizing Integration Owners Object */
  authoringIntegrationOwners: v.record(
    v.picklist([`GUILD_INSTALL`, `USER_INSTALL`]),
    v.union([snowflake as v.GenericSchema<string>, v.literal(0)])
  ),
  /** ID of the original response message, present only on follow-up messages */
  originalResponseMessageId:
    v.exactOptional<v.GenericSchema<string>>(snowflake),
  /** Metadata for the interaction that was used to open the modal */
  triggeringInteractionMetadata: v.union([
    applicationCommandInteractionMetadataSchea,
    messageComponentInteractionMetadataSchema
  ])
});

export interface ModalSubmitInteractionMetadata
  extends v.InferOutput<typeof modalSubmitInteractionMetadataSchema> {}
