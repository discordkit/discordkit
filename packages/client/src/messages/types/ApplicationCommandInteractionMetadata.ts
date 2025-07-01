import { snowflake } from "@discordkit/core";
import type { InferOutput } from "valibot";
import {
  exactOptional,
  literal,
  object,
  picklist,
  record,
  union
} from "valibot";
import { interactionTypeSchema } from "../../interactions/types/InteractionType.js";
import { userSchema } from "../../user/types/User.js";

/**
 * Metadata about the interaction, including the source of the interaction and relevant server and user IDs.
 *
 * One of Application Command Interaction Metadata, Message Component Interaction Metadata, or Modal Submit Interaction Metadata.
 */
export const applicationCommandInteractionMetadataSchea = object({
  /** ID of the interaction */
  id: snowflake,
  /** ype of interaction */
  type: interactionTypeSchema,
  /** User who triggered the interaction */
  user: userSchema,
  /** IDs for installation context(s) related to an interaction. Details in [Authorizing Integration Owners Object](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-authorizing-integration-owners-object) */
  authoringIntegrationOwners: record(
    picklist([`GUILD_INSTALL`, `USER_INSTALL`]),
    union([snowflake, literal(0)])
  ),
  /** ID of the original response message, present only on follow-up messages */
  originalResponseMessageId: exactOptional(snowflake),
  /** The user the command was run on, present only on user command interactions */
  targetUser: exactOptional(userSchema),
  /** The ID of the message the command was run on, present only on message command interactions. The original response message will also have `messageReference` and `referencedMessage` pointing to this message. */
  targetMessageId: exactOptional(snowflake)
});

export interface ApplicationCommandInteractionMetadata
  extends InferOutput<typeof applicationCommandInteractionMetadataSchea> {}
