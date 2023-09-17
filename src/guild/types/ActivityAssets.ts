import { z } from "zod";

export const activityAssets = z.object({
  /** see Activity Asset Image */
  largeImage: z.string().optional(),
  /** text displayed when hovering over the large image of the activity */
  largeText: z.string().optional(),
  /** see Activity Asset Image */
  smallImage: z.string().optional(),
  /** text displayed when hovering over the small image of the activity */
  smallText: z.string().optional()
});

export type ActivityAssets = z.infer<typeof activityAssets>;
