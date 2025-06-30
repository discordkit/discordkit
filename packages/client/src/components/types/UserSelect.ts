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
import { selectDefaultValueSchema } from "./SelectDefaultValue.js";

/**
 * A User Select is an interactive component that allows users to select one or more users in a message. Options are automatically populated based on the server's available users.
 *
 * User Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s) your app receives an interaction.
 *
 * User Selects must be placed inside an Action Row and are only available in messages. An Action Row can contain only one select menu and cannot contain buttons if it has a select menu.
 */
export const userSelectSchema = object({
  /** `5` for user select */
  type: literal(ComponentType.UserSelect),
  /** Optional identifier for component */
  id: exactOptional(
    pipe(number(), integer(), minValue(0), maxValue(Number.MAX_SAFE_INTEGER))
  ),
  /** Developer-defined identifier for the input; max 100 characters */
  customId: pipe(string(), nonEmpty(), maxLength(100)),
  /** Placeholder text if nothing is selected; max 150 characters */
  placeholder: exactOptional(pipe(string(), nonEmpty(), maxLength(150))),
  /** List of default values for auto-populated select menu components; number of default values must be in the range defined by `minValues` and `maxValues` */
  defaultValues: exactOptional(array(selectDefaultValueSchema)),
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

export type UserSelect = InferOutput<typeof userSelectSchema>;
