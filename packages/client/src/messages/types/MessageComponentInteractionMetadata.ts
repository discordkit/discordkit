import { snowflake } from "@discordkit/core";
import type { InferOutput } from "valibot";
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

export const messageComponentInteractionMetadataSchema = object({
  /** ID of the interaction */
  id: snowflake,
  /** Type of interaction */
  type: interactionTypeSchema,
  /** User who triggered the interaction */
  user: userSchema,
  /** IDs for installation context(s) related to an interaction. Details in Authorizing Integration Owners Object */
  authoringIntegrationOwners: record(
    picklist([`GUILD_INSTALL`, `USER_INSTALL`]),
    union([snowflake, literal(0)])
  ),
  /** ID of the original response message, present only on follow-up messages */
  originalResponseMessageId: exactOptional(snowflake),
  /** ID of the message that contained the interactive component */
  interactedMessageId: exactOptional(snowflake)
});

export type MessageComponentInteractionMetadata = InferOutput<
  typeof messageComponentInteractionMetadataSchema
>;
