import {
  object,
  literal,
  string,
  maxLength,
  number,
  integer,
  minValue,
  maxValue,
  nullish,
  boolean,
  type InferOutput,
  minLength,
  pipe
} from "valibot";
import { ComponentType } from "./ComponentType.js";
import { textInputStyleSchema } from "./TextInputStyle.js";

export const textInputSchema = object({
  /** 4 for a text input */
  type: literal(ComponentType.TextInput),
  /** Developer-defined identifier for the input; max 100 characters */
  customId: pipe(string(), maxLength(100)),
  /** The Text Input Style */
  style: textInputStyleSchema,
  /** Label for this component; max 45 characters */
  label: pipe(string(), maxLength(45)),
  /** Minimum input length for a text input; min 0, max 4000 */
  minLength: nullish(pipe(number(), integer(), minValue(0), maxValue(4000))),
  /** Maximum input length for a text input; min 1, max 4000 */
  maxLength: nullish(pipe(number(), integer(), minValue(0), maxValue(4000))),
  /** Whether this component is required to be filled (defaults to true) */
  required: nullish(boolean(), true),
  /** Pre-filled value for this component; max 4000 characters */
  value: nullish(pipe(string(), minLength(1), maxLength(4000))),
  /** Custom placeholder text if the input is empty; max 100 characters */
  placeholder: nullish(pipe(string(), maxLength(100)))
});

export type TextInput = InferOutput<typeof textInputSchema>;
