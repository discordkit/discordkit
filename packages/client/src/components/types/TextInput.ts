import {
  object,
  literal,
  string,
  maxLength,
  number,
  integer,
  minValue,
  maxValue,
  boolean,
  pipe,
  exactOptional,
  nonEmpty,
  type InferOutput
} from "valibot";
import { ComponentType } from "./ComponentType.js";
import { textInputStyleSchema } from "./TextInputStyle.js";

/**
 * Text Input is an interactive component that allows users to enter free-form text responses in modals. It supports both short, single-line inputs and longer, multi-line paragraph inputs.
 *
 * Text Inputs can only be used within modals and must be placed inside an Action Row.
 *
 * When defining a text input component, you can set attributes to customize the behavior and appearance of it. However, not all attributes will be returned in the text input interaction payload.
 */
export const textInputSchema = object({
  /** `4` for a text input */
  type: literal(ComponentType.TextInput),
  /** Optional identifier for component */
  id: exactOptional(
    pipe(number(), integer(), minValue(0), maxValue(Number.MAX_SAFE_INTEGER))
  ),
  /** Developer-defined identifier for the input; max 100 characters */
  customId: pipe(string(), nonEmpty(), maxLength(100)),
  /** The Text Input Style */
  style: textInputStyleSchema,
  /** Label for this component; max 45 characters */
  label: pipe(string(), nonEmpty(), maxLength(45)),
  /** Minimum input length for a text input; min 0, max 4000 */
  minLength: exactOptional(
    pipe(number(), integer(), minValue(0), maxValue(4000))
  ),
  /** Maximum input length for a text input; min 1, max 4000 */
  maxLength: exactOptional(
    pipe(number(), integer(), minValue(1), maxValue(4000))
  ),
  /** Whether this component is required to be filled (defaults to true) */
  required: exactOptional(boolean(), true),
  /** Pre-filled value for this component; max 4000 characters */
  value: exactOptional(pipe(string(), nonEmpty(), maxLength(4000))),
  /** Custom placeholder text if the input is empty; max 100 characters */
  placeholder: exactOptional(pipe(string(), nonEmpty(), maxLength(100)))
});

export type TextInput = InferOutput<typeof textInputSchema>;
