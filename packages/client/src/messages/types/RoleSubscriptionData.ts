import * as v from "valibot";
import { snowflake, boundedInteger, boundedString } from "@discordkit/core";

export const roleSubscriptionDataSchema = v.object({
  /** the id of the sku and listing that the user is subscribed to */
  roleSubscriptionListingId: snowflake,
  /** the name of the tier that the user is subscribed to */
  tierName: boundedString(),
  /** the cumulative number of months that the user has been subscribed for */
  totalMonthsSubscribed: boundedInteger(),
  /** whether this notification is for a renewal rather than a new purchase */
  isRenewal: v.boolean()
});

export interface RoleSubscriptionData
  extends v.InferOutput<typeof roleSubscriptionDataSchema> {}
