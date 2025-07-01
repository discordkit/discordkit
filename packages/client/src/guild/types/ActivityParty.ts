import * as v from "valibot";
import { snowflake } from "@discordkit/core";

export const activityPartySchema = v.object({
  /** the id of the party */
  id: snowflake,
  /** (current_size, max_size)	used to show the party's current and maximum size */
  size: v.optional(
    v.tuple([
      /** currentSize */
      v.number(),
      /** maxSize */
      v.number()
    ])
  )
});

export interface ActivityParty
  extends v.InferOutput<typeof activityPartySchema> {}
