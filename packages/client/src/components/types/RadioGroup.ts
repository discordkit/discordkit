import * as v from "valibot";
import { boundedArray } from "@discordkit/core/validations/boundedArray";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema } from "@discordkit/core/validations/schema";
import { ComponentType } from "./ComponentType.js";
import { radioGroupOptionSchema } from "./RadioGroupOption.js";

const _radioGroupSchema = v.object({
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

export interface RadioGroup extends v.InferOutput<typeof _radioGroupSchema> {}

/**
 * ### [Radio Group](https://discord.com/developers/docs/components/reference#radio-group-structure)
 *
 * A Radio Group is an interactive component for selecting exactly one option from a defined list. Radio Groups are available in modals and must be placed inside a {@link Label}.
 */
export const radioGroupSchema = schema<RadioGroup>(_radioGroupSchema);
