import * as v from "valibot";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema } from "@discordkit/core/validations/schema";
import { ComponentType } from "./ComponentType.js";
import { textInputStyleSchema } from "./TextInputStyle.js";

const _textInputSchema = v.object({
  /** `4` for a text input */
  type: v.literal(ComponentType.TextInput),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** Developer-defined identifier for the input; max 100 characters */
  customId: boundedString({ max: 100 }),
  /** The Text Input Style */
  style: textInputStyleSchema,
  /** Label for this component; max 45 characters */
  label: boundedString({ max: 45 }),
  /** Minimum input length for a text input; min 0, max 4000 */
  minLength: v.exactOptional(boundedInteger({ min: 0, max: 4000 })),
  /** Maximum input length for a text input; min 1, max 4000 */
  maxLength: v.exactOptional(boundedInteger({ min: 1, max: 4000 })),
  /** Whether this component is required to be filled (defaults to true) */
  required: v.exactOptional(v.boolean()),
  /** Pre-filled value for this component; max 4000 characters */
  value: v.exactOptional(boundedString({ max: 4000 })),
  /** Custom placeholder text if the input is empty; max 100 characters */
  placeholder: v.exactOptional(boundedString({ max: 100 }))
});

export interface TextInput extends v.InferOutput<typeof _textInputSchema> {}

/**
 * ### [Text Input](https://discord.com/developers/docs/components/reference#text-input)
 *
 * Text Input is an interactive component that allows users to enter free-form text responses in modals. It supports both short, single-line inputs and longer, multi-line paragraph inputs. Text Inputs can only be used within modals and must be placed inside a Label.
 */
export const textInputSchema = schema<TextInput>(_textInputSchema);
