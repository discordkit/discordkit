import type { InferOutput } from "valibot";
import {
  array,
  exactOptional,
  integer,
  literal,
  maxLength,
  maxValue,
  minValue,
  nonEmpty,
  number,
  object,
  pipe
} from "valibot";
import { ComponentType } from "./ComponentType.js";
import { mediaGalleryItemSchema } from "./MediaGalleryItem.js";

/**
 * A Media Gallery is a top-level content component that allows you to display 1-10 media attachments in an organized gallery format. Each item can have optional descriptions and can be marked as spoilers.
 *
 * Media Galleries are only available in messages.
 *
 * > [!NOTE]
 * >
 * > To use this component, you need to send the message flag `1 << 15` (IS_COMPONENTS_V2) which can be activated on a per-message basis.
 */
export const mediaGallerySchema = object({
  /** `12` for media gallery component */
  type: literal(ComponentType.MediaGallery),
  /** Optional identifier for component */
  id: exactOptional(
    pipe(number(), integer(), minValue(0), maxValue(Number.MAX_SAFE_INTEGER))
  ),
  /** 1 to 10 media gallery items */
  items: pipe(array(mediaGalleryItemSchema), nonEmpty(), maxLength(10))
});

export type MediaGallery = InferOutput<typeof mediaGallerySchema>;
