import type { InferOutput } from "valibot";
import {
  array,
  boolean,
  exactOptional,
  integer,
  literal,
  maxValue,
  minValue,
  nullish,
  number,
  object,
  pipe,
  union
} from "valibot";
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
export const containerSchema = object({
  /** `17` for container component */
  type: literal(ComponentType.Container),
  /** Optional identifier for component */
  id: exactOptional(
    pipe(number(), integer(), minValue(0), maxValue(Number.MAX_SAFE_INTEGER))
  ),
  /** Components of the type action row, text display, section, media gallery, separator, or file */
  components: array(
    union([
      actionRowSchema,
      textDisplaySchema,
      sectionSchema,
      mediaGallerySchema,
      separatorSchema,
      fileSchema
    ])
  ),
  /** Color for the accent on the container as RGB from `0x000000` to `0xFFFFFF` */
  accentColor: nullish(
    pipe(number(), integer(), minValue(0x000000), maxValue(0xffffff))
  ),
  /** Whether the container should be a spoiler (or blurred out). Defaults to `false`. */
  spoiler: exactOptional(boolean())
});

export interface Container extends InferOutput<typeof containerSchema> {}
