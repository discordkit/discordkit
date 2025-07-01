import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { interactionTypeSchema } from "../../interactions/types/InteractionType.js";
import { userSchema } from "../../user/types/User.js";

/**
 * Metadata about the interaction, including the source of the interaction and relevant server and user IDs.
 *
 * One of Application Command Interaction Metadata, Message Component Interaction Metadata, or Modal Submit Interaction Metadata.
 */
export const applicationCommandInteractionMetadataSchea = v.object({
  /** ID of the interaction */
  id: snowflake,
  /** ype of interaction */
  type: interactionTypeSchema,
  /** User who triggered the interaction */
  user: userSchema,
  /** IDs for installation context(s) related to an interaction. Details in [Authorizing Integration Owners Object](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-authorizing-integration-owners-object) */
  authoringIntegrationOwners: v.record(
    v.picklist([`GUILD_INSTALL`, `USER_INSTALL`]),
    v.union([snowflake, v.literal(0)])
  ),
  /** ID of the original response message, present only on follow-up messages */
  originalResponseMessageId: v.exactOptional(snowflake),
  /** The user the command was run on, present only on user command interactions */
  targetUser: v.exactOptional(userSchema),
  /** The ID of the message the command was run on, present only on message command interactions. The original response message will also have `messageReference` and `referencedMessage` pointing to this message. */
  targetMessageId: v.exactOptional(snowflake)
});

export interface ApplicationCommandInteractionMetadata
  extends v.InferOutput<typeof applicationCommandInteractionMetadataSchea> {}
