import { snowflake } from "@discordkit/core";
import { z } from "zod";

export const activityPartySchema = z.object({
  /** the id of the party */
  id: snowflake,
  /** (current_size, max_size)	used to show the party's current and maximum size */
  size: z
    .tuple([
      /** currentSize */
      z.number(),
      /** maxSize */
      z.number()
    ])
    .optional()
});

export type ActivityParty = z.infer<typeof activityPartySchema>;
