import * as v from "valibot";
import { ComponentType } from "./ComponentType.js";

/**
 * A Separator is a top-level layout component that adds vertical padding and visual division between other components.
 *
 * Separators are only available in messages.
 *
 * > [!NOTE]
 * >
 * > To use this component, you need to send the message flag `1 << 15` (IS_COMPONENTS_V2) which can be activated on a per-message basis.
 */
export const separatorSchema = v.object({
  /** `14` for separator component */
  type: v.literal(ComponentType.Separator),
  /** Optional identifier for component */
  id: v.exactOptional(
    v.pipe(
      v.number(),
      v.integer(),
      v.minValue(0),
      v.maxValue(Number.MAX_SAFE_INTEGER)
    )
  ),
  /** Whether a visual divider should be displayed in the component. Defaults to `true` */
  divider: v.exactOptional(v.boolean()),
  /** Size of separator padding— `1` for small padding, `2` for large padding. Defaults to `1` */
  spacing: v.exactOptional(v.picklist([1, 2]))
});

export interface Separator extends v.InferOutput<typeof separatorSchema> {}
