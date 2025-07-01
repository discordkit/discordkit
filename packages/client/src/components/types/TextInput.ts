import * as v from "valibot";
import { ComponentType } from "./ComponentType.js";
import { textInputStyleSchema } from "./TextInputStyle.js";

/**
 * Text Input is an interactive component that allows users to enter free-form text responses in modals. It supports both short, single-line inputs and longer, multi-line paragraph inputs.
 *
 * Text Inputs can only be used within modals and must be placed inside an Action Row.
 *
 * When defining a text input component, you can set attributes to customize the behavior and appearance of it. However, not all attributes will be returned in the text input interaction payload.
 */
export const textInputSchema = v.object({
  /** `4` for a text input */
  type: v.literal(ComponentType.TextInput),
  /** Optional identifier for component */
  id: v.exactOptional(
    v.pipe(
      v.number(),
      v.integer(),
      v.minValue(0),
      v.maxValue(Number.MAX_SAFE_INTEGER)
    )
  ),
  /** Developer-defined identifier for the input; max 100 characters */
  customId: v.pipe(v.string(), v.nonEmpty(), v.maxLength(100)),
  /** The Text Input Style */
  style: textInputStyleSchema,
  /** Label for this component; max 45 characters */
  label: v.pipe(v.string(), v.nonEmpty(), v.maxLength(45)),
  /** Minimum input length for a text input; min 0, max 4000 */
  minLength: v.exactOptional(
    v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(4000))
  ),
  /** Maximum input length for a text input; min 1, max 4000 */
  maxLength: v.exactOptional(
    v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(4000))
  ),
  /** Whether this component is required to be filled (defaults to true) */
  required: v.exactOptional(v.boolean(), true),
  /** Pre-filled value for this component; max 4000 characters */
  value: v.exactOptional(v.pipe(v.string(), v.nonEmpty(), v.maxLength(4000))),
  /** Custom placeholder text if the input is empty; max 100 characters */
  placeholder: v.exactOptional(
    v.pipe(v.string(), v.nonEmpty(), v.maxLength(100))
  )
});

export interface TextInput extends v.InferOutput<typeof textInputSchema> {}
