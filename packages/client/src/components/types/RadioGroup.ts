import * as v from "valibot";
import { boundedArray, boundedInteger, boundedString } from "@discordkit/core";
import { ComponentType } from "./ComponentType.js";
import { radioGroupOptionSchema } from "./RadioGroupOption.js";

/**
 * A Radio Group is an interactive component for selecting exactly one
 * option from a defined list. Radio Groups are available in modals and
 * must be placed inside a {@link Label}.
 */
export const radioGroupSchema = v.object({
  /** `21` for radio group */
  type: v.literal(ComponentType.RadioGroup),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** Developer-defined identifier for the input; 1-100 characters */
  customId: boundedString({ min: 1, max: 100 }),
  /** List of options to show; min 2, max 10 */
  options: boundedArray(radioGroupOptionSchema, { min: 2, max: 10 }),
  /** Whether a selection is required to submit the modal (defaults to `true`) */
  required: v.exactOptional(v.boolean())
});

export interface RadioGroup extends v.InferOutput<typeof radioGroupSchema> {}
