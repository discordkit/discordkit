import type { InferOutput } from "valibot";
import {
  boolean,
  exactOptional,
  integer,
  literal,
  maxValue,
  minValue,
  number,
  object,
  picklist,
  pipe
} from "valibot";
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
export const separatorSchema = object({
  /** `14` for separator component */
  type: literal(ComponentType.Separator),
  /** Optional identifier for component */
  id: exactOptional(
    pipe(number(), integer(), minValue(0), maxValue(Number.MAX_SAFE_INTEGER))
  ),
  /** Whether a visual divider should be displayed in the component. Defaults to `true` */
  divider: exactOptional(boolean()),
  /** Size of separator padding— `1` for small padding, `2` for large padding. Defaults to `1` */
  spacing: exactOptional(picklist([1, 2]))
});

export type Separator = InferOutput<typeof separatorSchema>;
