import { snowflake } from "@discordkit/core";
import { object, null_, type InferOutput, exactOptional } from "valibot";

/**
 * Tags with type null represent booleans. They will be present and set to null if they are "true", and will be not present if they are "false".
 */
export const roleTagSchema = object({
  /** the id of the bot this role belongs to */
  botId: exactOptional(snowflake),
  /** the id of the integration this role belongs to */
  integrationId: exactOptional(snowflake),
  /** whether this is the guild's premium subscriber role */
  premiumSubscriber: exactOptional(null_()),
  /** the id of this role's subscription sku and listing */
  subscriptionListingId: exactOptional(snowflake),
  /** whether this role is available for purchase */
  availableForPurchase: exactOptional(null_()),
  /** whether this role is a guild's linked role */
  guildConnections: exactOptional(null_())
});

export type RoleTag = InferOutput<typeof roleTagSchema>;
