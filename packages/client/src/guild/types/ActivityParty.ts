import { snowflake } from "@discordkit/core";
import { object, tuple, number, optional, type Output } from "valibot";

export const activityPartySchema = object({
  /** the id of the party */
  id: snowflake,
  /** (current_size, max_size)	used to show the party's current and maximum size */
  size: optional(
    tuple([
      /** currentSize */
      number(),
      /** maxSize */
      number()
    ])
  )
});

export type ActivityParty = Output<typeof activityPartySchema>;
