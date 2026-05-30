import * as v from "valibot";
import { boundedInteger, boundedString } from "@discordkit/core";
import { ComponentType } from "./ComponentType.js";

/**
 * ### [Checkbox](https://discord.com/developers/docs/components/reference#checkbox-structure)
 *
 * A Checkbox is a single interactive component for simple yes/no style questions. Checkboxes are available in modals and must be placed inside a {@link Label}.
 *
 * > [!TIP]
 * >
 * > While you can't set a checkbox as required, you can use a
 * > {@link CheckboxGroup} with a single option and `required: true` to
 * > achieve similar functionality.
 */
export const checkboxSchema = v.object({
  /** `23` for checkbox */
  type: v.literal(ComponentType.Checkbox),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** Developer-defined identifier for the input; 1-100 characters */
  customId: boundedString({ min: 1, max: 100 }),
  /** Whether the checkbox is selected by default */
  default: v.exactOptional(v.boolean())
});

export interface Checkbox extends v.InferOutput<typeof checkboxSchema> {}
