import { z } from "zod";

export const activityParty = z.object({
  /** the id of the party */
  id: z.string().optional(),
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

export type ActivityParty = z.infer<typeof activityParty>;
