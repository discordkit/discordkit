import * as v from "valibot";

export const activityAssetsSchema = v.object({
  /** see Activity Asset Image */
  largeImage: v.optional(v.string()),
  /** text displayed when hovering over the large image of the activity */
  largeText: v.optional(v.string()),
  /** see Activity Asset Image */
  smallImage: v.optional(v.string()),
  /** text displayed when hovering over the small image of the activity */
  smallText: v.optional(v.string())
});

export interface ActivityAssets
  extends v.InferOutput<typeof activityAssetsSchema> {}
