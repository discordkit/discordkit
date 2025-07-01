import type { InferOutput } from "valibot";
import {
  boolean,
  exactOptional,
  maxLength,
  nonEmpty,
  object,
  pipe,
  string
} from "valibot";
import { unfurledMediaItemSchema } from "./UnfurledMediaItem.js";

export const mediaGalleryItemSchema = object({
  /** A url or attachment */
  media: unfurledMediaItemSchema,
  /** Alt text for the media, max 1024 characters */
  description: exactOptional(pipe(string(), nonEmpty(), maxLength(1024))),
  /** Whether the media should be a spoiler (or blurred out). Defaults to `false` */
  spoiler: exactOptional(boolean())
});

export interface MediaGalleryItem
  extends InferOutput<typeof mediaGalleryItemSchema> {}
