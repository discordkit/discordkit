import { snowflake } from "@discordkit/core";
import type { InferOutput } from "valibot";
import {
  boolean,
  integer,
  minValue,
  nonEmpty,
  number,
  object,
  pipe,
  string
} from "valibot";

export const roleSubscriptionDataSchema = object({
  /** the id of the sku and listing that the user is subscribed to */
  roleSubscriptionListingId: snowflake,
  /** the name of the tier that the user is subscribed to */
  tierName: pipe(string(), nonEmpty()),
  /** the cumulative number of months that the user has been subscribed for */
  totalMonthsSubscribed: pipe(number(), integer(), minValue(0)),
  /** whether this notification is for a renewal rather than a new purchase */
  isRenewal: boolean()
});

export type RoleSubscriptionData = InferOutput<
  typeof roleSubscriptionDataSchema
>;
