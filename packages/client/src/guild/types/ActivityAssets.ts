import { object, optional, string, type InferOutput } from "valibot";

export const activityAssetsSchema = object({
  /** see Activity Asset Image */
  largeImage: optional(string()),
  /** text displayed when hovering over the large image of the activity */
  largeText: optional(string()),
  /** see Activity Asset Image */
  smallImage: optional(string()),
  /** text displayed when hovering over the small image of the activity */
  smallText: optional(string())
});

export interface ActivityAssets
  extends InferOutput<typeof activityAssetsSchema> {}
