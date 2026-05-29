import * as v from "valibot";
import { boundedString } from "@discordkit/core";

/**
 * Option shape for {@link RadioGroup} components.
 *
 * Radio group and {@link CheckboxGroupOption | checkbox group} options
 * share the same field layout. We model them separately so that future
 * Discord changes to one shape don't have to ripple to the other.
 */
export const radioGroupOptionSchema = v.object({
  /** Dev-defined value of the option; max 100 characters */
  value: boundedString({ max: 100 }),
  /** User-facing label of the option; max 100 characters */
  label: boundedString({ max: 100 }),
  /** Optional description for the option; max 100 characters */
  description: v.exactOptional(boundedString({ max: 100 })),
  /** Shows the option as selected by default */
  default: v.exactOptional(v.boolean())
});

export interface RadioGroupOption extends v.InferOutput<
  typeof radioGroupOptionSchema
> {}
