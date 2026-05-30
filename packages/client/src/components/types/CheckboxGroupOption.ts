import * as v from "valibot";
import { boundedString } from "@discordkit/core";

/**
 * ### [Checkbox Group Option](https://discord.com/developers/docs/components/reference#checkbox-group-option-structure)
 *
 * Option shape for {@link CheckboxGroup} components.
 *
 * Structurally identical to {@link RadioGroupOption} today, but kept separate so future divergence in either component's option layout doesn't have to ripple across both.
 */
export const checkboxGroupOptionSchema = v.object({
  /** Dev-defined value of the option; max 100 characters */
  value: boundedString({ max: 100 }),
  /** User-facing label of the option; max 100 characters */
  label: boundedString({ max: 100 }),
  /** Optional description for the option; max 100 characters */
  description: v.exactOptional(boundedString({ max: 100 })),
  /** Shows the option as selected by default */
  default: v.exactOptional(v.boolean())
});

export interface CheckboxGroupOption extends v.InferOutput<
  typeof checkboxGroupOptionSchema
> {}
