import { snowflake } from "@discordkit/core";
import { z } from "zod";

export const roleSubscriptionDataSchema = z.object({
  /** the id of the sku and listing that the user is subscribed to */
  roleSubscriptionListingId: snowflake,
  /** the name of the tier that the user is subscribed to */
  tierName: z.string().min(1),
  /** the cumulative number of months that the user has been subscribed for */
  totalMonthsSubscribed: z.number().int().positive(),
  /** whether this notification is for a renewal rather than a new purchase */
  isRenewal: z.boolean()
});

export type RoleSubscriptionData = z.infer<typeof roleSubscriptionDataSchema>;
