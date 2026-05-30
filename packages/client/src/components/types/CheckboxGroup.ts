import * as v from "valibot";
import { boundedArray, boundedInteger, boundedString } from "@discordkit/core";
import { ComponentType } from "./ComponentType.js";
import { checkboxGroupOptionSchema } from "./CheckboxGroupOption.js";

/**
 * ### [Checkbox Group](https://discord.com/developers/docs/components/reference#checkbox-group-structure)
 *
 * A {@link CheckboxGroupOption | Checkbox Group} is an interactive component for selecting one or many options via checkboxes. Checkbox Groups are available in modals and must be placed inside a {@link Label}.
 *
 * > [!NOTE]
 * >
 * > `minValues` must be either omitted or at least `1` if `required` is
 * > omitted or `true`.
 */
export const checkboxGroupSchema = v.object({
  /** `22` for {@link CheckboxGroupOption | checkbox group} */
  type: v.literal(ComponentType.CheckboxGroup),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** Developer-defined identifier for the input; 1-100 characters */
  customId: boundedString({ min: 1, max: 100 }),
  /** List of options to show; min 1, max 10 */
  options: boundedArray(checkboxGroupOptionSchema, { min: 1, max: 10 }),
  /** Minimum number of items that must be chosen; min 0, max 10 (defaults to 1) */
  minValues: v.exactOptional(boundedInteger({ min: 0, max: 10 })),
  /** Maximum number of items that can be chosen; min 1, max 10 (defaults to the number of options) */
  maxValues: v.exactOptional(boundedInteger({ min: 1, max: 10 })),
  /** Whether selecting within the group is required (defaults to `true`) */
  required: v.exactOptional(v.boolean())
});

export interface CheckboxGroup extends v.InferOutput<
  typeof checkboxGroupSchema
> {}
