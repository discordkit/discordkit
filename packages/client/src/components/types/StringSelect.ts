import type { InferOutput } from "valibot";
import {
  array,
  boolean,
  exactOptional,
  integer,
  literal,
  maxLength,
  maxValue,
  minValue,
  nonEmpty,
  number,
  object,
  pipe,
  string
} from "valibot";
import { ComponentType } from "./ComponentType.js";
import { selectOptionSchema } from "./SelectOption.js";

/**
 * A String Select is an interactive component that allows users to select one or more provided `options` in a message.
 *
 * String Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s) your app receives an interaction.
 *
 * String Selects must be placed inside an Action Row and are only available in messages. An Action Row can contain only one select menu and cannot contain buttons if it has a select menu.
 */
export const stringSelectSchema = object({
  /** `3` for string select */
  type: literal(ComponentType.StringSelect),
  /** Optional identifier for component */
  id: exactOptional(
    pipe(number(), integer(), minValue(0), maxValue(Number.MAX_SAFE_INTEGER))
  ),
  /** ID for the select menu; max 100 characters */
  customId: pipe(string(), nonEmpty(), maxLength(100)),
  /** Specified choices in a select menu; max 25 */
  options: pipe(array(selectOptionSchema), maxLength(25)),
  /** Placeholder text if nothing is selected or default; max 150 characters */
  placeholder: exactOptional(pipe(string(), nonEmpty(), maxLength(150))),
  /** Minimum number of items that must be chosen (defaults to 1); min 0, max 25 */
  minValues: exactOptional(
    pipe(number(), integer(), minValue(0), maxValue(25))
  ),
  /** Maximum number of items that can be chosen (defaults to 1); max 25 */
  maxValues: exactOptional(
    pipe(number(), integer(), minValue(1), maxValue(25))
  ),
  /** Whether select menu is disabled (defaults to `false`) */
  disabled: exactOptional(boolean())
});

export interface StringSelect extends InferOutput<typeof stringSelectSchema> {}
