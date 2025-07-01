import * as v from "valibot";
import { ComponentType } from "./ComponentType.js";
import { buttonSchema } from "./Button.js";
import { textDisplaySchema } from "./TextDisplay.js";
import { thumbnailSchema } from "./Thumbnail.js";

/**
 * A Section is a top-level layout component that allows you to join text contextually with an accessory.
 *
 * Sections are only available in messages.
 *
 * > [!NOTE]
 * >
 * > To use this component, you need to send the message flag `1 << 15` (IS_COMPONENTS_V2) which can be activated on a per-message basis.
 *
 * > [!NOTE]
 * >
 * > Don't hardcode `components` to contain only text components. We may add other components in the future. Similarly, `accessory` may be expanded to include other components in the future.
 */
export const sectionSchema = v.object({
  /** `9` for section component */
  type: v.literal(ComponentType.Section),
  /** Optional identifier for component */
  id: v.exactOptional(
    v.pipe(
      v.number(),
      v.integer(),
      v.minValue(0),
      v.maxValue(Number.MAX_SAFE_INTEGER)
    )
  ),
  /** One to three text components */
  components: v.pipe(v.array(textDisplaySchema), v.nonEmpty(), v.maxLength(3)),
  /** A thumbnail or a button component, with a future possibility of adding more compatible components */
  accessroy: v.union([thumbnailSchema, buttonSchema])
});

export interface Section extends v.InferOutput<typeof sectionSchema> {}
