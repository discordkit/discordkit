import { snowflake } from "@discordkit/core";
import {
  object,
  string,
  minLength,
  number,
  integer,
  minValue,
  boolean,
  type InferOutput,
  pipe
} from "valibot";

export const roleSubscriptionDataSchema = object({
  /** the id of the sku and listing that the user is subscribed to */
  roleSubscriptionListingId: snowflake,
  /** the name of the tier that the user is subscribed to */
  tierName: pipe(string(), minLength(1)),
  /** the cumulative number of months that the user has been subscribed for */
  totalMonthsSubscribed: pipe(number(), integer(), minValue(0)),
  /** whether this notification is for a renewal rather than a new purchase */
  isRenewal: boolean()
});

export type RoleSubscriptionData = InferOutput<
  typeof roleSubscriptionDataSchema
>;
