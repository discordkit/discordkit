import * as v from "valibot";
import { actionRowSchema } from "./ActionRow.js";
import { textDisplaySchema } from "./TextDisplay.js";
import { sectionSchema } from "./Section.js";
import { mediaGallerySchema } from "./MediaGallery.js";
import { separatorSchema } from "./Separator.js";
import { fileSchema } from "./File.js";
import { ComponentType } from "./ComponentType.js";

/**
 * A Container is a top-level layout component. Containers are visually distinct from surrounding components and have an optional customizable color bar.
 *
 * Containers are only available in messages.
 *
 * > [!NOTE]
 * >
 * > To use this component, you need to send the message flag `1 << 15` (IS_COMPONENTS_V2) which can be activated on a per-message basis.
 */
export const containerSchema = v.object({
  /** `17` for container component */
  type: v.literal(ComponentType.Container),
  /** Optional identifier for component */
  id: v.exactOptional(
    v.pipe(
      v.number(),
      v.integer(),
      v.minValue(0),
      v.maxValue(Number.MAX_SAFE_INTEGER)
    )
  ),
  /** Components of the type action row, text display, section, media gallery, separator, or file */
  components: v.array(
    v.union([
      actionRowSchema,
      textDisplaySchema,
      sectionSchema,
      mediaGallerySchema,
      separatorSchema,
      fileSchema
    ])
  ),
  /** Color for the accent on the container as RGB from `0x000000` to `0xFFFFFF` */
  accentColor: v.nullish(
    v.pipe(v.number(), v.integer(), v.minValue(0x000000), v.maxValue(0xffffff))
  ),
  /** Whether the container should be a spoiler (or blurred out). Defaults to `false`. */
  spoiler: v.exactOptional(v.boolean())
});

export interface Container extends v.InferOutput<typeof containerSchema> {}
