import * as v from "valibot";
import { boundedArray, boundedInteger, boundedString } from "@discordkit/core";
import { ComponentType } from "./ComponentType.js";
import { selectOptionSchema } from "./SelectOption.js";

/**
 * A String Select is an interactive component that allows users to select one or more provided `options` in a message.
 *
 * String Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s) your app receives an interaction.
 *
 * String Selects must be placed inside an Action Row and are only available in messages. An Action Row can contain only one select menu and cannot contain buttons if it has a select menu.
 */
export const stringSelectSchema = v.object({
  /** `3` for string select */
  type: v.literal(ComponentType.StringSelect),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** ID for the select menu; max 100 characters */
  customId: boundedString({ max: 100 }),
  /** Specified choices in a select menu; max 25 */
  options: boundedArray(selectOptionSchema, { max: 25 }),
  /** Placeholder text if nothing is selected or default; max 150 characters */
  placeholder: v.exactOptional(boundedString({ max: 150 })),
  /** Minimum number of items that must be chosen (defaults to 1); min 0, max 25 */
  minValues: v.exactOptional(boundedInteger({ max: 25 })),
  /** Maximum number of items that can be chosen (defaults to 1); max 25 */
  maxValues: v.exactOptional(boundedInteger({ min: 1, max: 25 })),
  /** Whether select menu is disabled (defaults to `false`) */
  disabled: v.exactOptional(v.boolean())
});

export interface StringSelect
  extends v.InferOutput<typeof stringSelectSchema> {}
