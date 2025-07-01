import { snowflake } from "@discordkit/core";
import type { GenericSchema, InferOutput } from "valibot";
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
  roleSubscriptionListingId: snowflake as GenericSchema<string>,
  /** the name of the tier that the user is subscribed to */
  tierName: pipe(string(), nonEmpty()) as GenericSchema<string>,
  /** the cumulative number of months that the user has been subscribed for */
  totalMonthsSubscribed: pipe(
    number(),
    integer(),
    minValue(0)
  ) as GenericSchema<number>,
  /** whether this notification is for a renewal rather than a new purchase */
  isRenewal: boolean()
});

export interface RoleSubscriptionData
  extends InferOutput<typeof roleSubscriptionDataSchema> {}
