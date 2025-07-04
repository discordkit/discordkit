import * as v from "valibot";
import { boundedString } from "@discordkit/core";
import { unfurledMediaItemSchema } from "./UnfurledMediaItem.js";

export const mediaGalleryItemSchema = v.object({
  /** A url or attachment */
  media: unfurledMediaItemSchema,
  /** Alt text for the media, max 1024 characters */
  description: v.exactOptional(boundedString({ max: 1024 })),
  /** Whether the media should be a spoiler (or blurred out). Defaults to `false` */
  spoiler: v.exactOptional(v.boolean())
});

export interface MediaGalleryItem
  extends v.InferOutput<typeof mediaGalleryItemSchema> {}
