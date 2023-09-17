import { z } from "zod";

export const activityEmoji = z.object({
  /** the name of the emoji */
  name: z.string(),
  /** the id of the emoji */
  id: z.string().optional(),
  /** whether this emoji is animated */
  animated: z.boolean().optional()
});

export type ActivityEmoji = z.infer<typeof activityEmoji>;
