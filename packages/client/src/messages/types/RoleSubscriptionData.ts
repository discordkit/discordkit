import * as v from "valibot";
import { snowflake } from "@discordkit/core";

export const roleSubscriptionDataSchema = v.object({
  /** the id of the sku and listing that the user is subscribed to */
  roleSubscriptionListingId: snowflake as v.GenericSchema<string>,
  /** the name of the tier that the user is subscribed to */
  tierName: v.pipe(v.string(), v.nonEmpty()) as v.GenericSchema<string>,
  /** the cumulative number of months that the user has been subscribed for */
  totalMonthsSubscribed: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(0)
  ) as v.GenericSchema<number>,
  /** whether this notification is for a renewal rather than a new purchase */
  isRenewal: v.boolean()
});

export interface RoleSubscriptionData
  extends v.InferOutput<typeof roleSubscriptionDataSchema> {}
