import * as v from "valibot";
import { snowflake } from "@discordkit/core";

/**
 * Tags with type null represent booleans. They will be present and set to null if they are "true", and will be not present if they are "false".
 */
export const roleTagSchema = v.object({
  /** the id of the bot this role belongs to */
  botId: v.exactOptional(snowflake),
  /** the id of the integration this role belongs to */
  integrationId: v.exactOptional(snowflake),
  /** whether this is the guild's premium subscriber role */
  premiumSubscriber: v.exactOptional(v.null_()),
  /** the id of this role's subscription sku and listing */
  subscriptionListingId: v.exactOptional(snowflake),
  /** whether this role is available for purchase */
  availableForPurchase: v.exactOptional(v.null_()),
  /** whether this role is a guild's linked role */
  guildConnections: v.exactOptional(v.null_())
});

export interface RoleTag extends v.InferOutput<typeof roleTagSchema> {}
