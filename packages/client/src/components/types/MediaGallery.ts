import * as v from "valibot";
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
export const mediaGallerySchema = v.object({
  /** `12` for media gallery component */
  type: v.literal(ComponentType.MediaGallery),
  /** Optional identifier for component */
  id: v.exactOptional(
    v.pipe(
      v.number(),
      v.integer(),
      v.minValue(0),
      v.maxValue(Number.MAX_SAFE_INTEGER)
    )
  ),
  /** 1 to 10 media gallery items */
  items: v.pipe(v.array(mediaGalleryItemSchema), v.nonEmpty(), v.maxLength(10))
});

export interface MediaGallery
  extends v.InferOutput<typeof mediaGallerySchema> {}
