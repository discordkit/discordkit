import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { interactionTypeSchema } from "../../interactions/types/InteractionType.js";
import { userSchema } from "../../user/types/User.js";

export const messageComponentInteractionMetadataSchema = v.object({
  /** ID of the interaction */
  id: snowflake,
  /** Type of interaction */
  type: interactionTypeSchema,
  /** User who triggered the interaction */
  user: userSchema,
  /** IDs for installation context(s) related to an interaction. Details in Authorizing Integration Owners Object */
  authoringIntegrationOwners: v.record(
    v.picklist([`GUILD_INSTALL`, `USER_INSTALL`]),
    v.union([snowflake, v.literal(0)])
  ),
  /** ID of the original response message, present only on follow-up messages */
  originalResponseMessageId: v.exactOptional(snowflake),
  /** ID of the message that contained the interactive component */
  interactedMessageId: v.exactOptional(snowflake)
});

export interface MessageComponentInteractionMetadata
  extends v.InferOutput<typeof messageComponentInteractionMetadataSchema> {}
