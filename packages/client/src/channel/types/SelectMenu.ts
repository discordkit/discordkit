import {
  object,
  union,
  literal,
  string,
  maxLength,
  array,
  nullish,
  number,
  integer,
  minValue,
  maxValue,
  boolean,
  type InferOutput,
  pipe
} from "valibot";
import { ComponentType } from "./ComponentType.js";
import { selectOptionSchema } from "./SelectOption.js";
import { selectDefaultValueSchema } from "./SelectDefaultValue.js";
import { channelTypeSchema } from "./ChannelType.js";

export const selectMenuSchema = object({
  /** Type of select menu component (text: 3, user: 5, role: 6, mentionable: 7, channels: 8) */
  type: union([
    literal(ComponentType.StringSelect),
    literal(ComponentType.UserSelect),
    literal(ComponentType.RoleSelect),
    literal(ComponentType.MentionableSelect),
    literal(ComponentType.ChannelSelect)
  ]),
  /** ID for the select menu; max 100 characters */
  customId: pipe(string(), maxLength(100)),
  /** Specified choices in a select menu (only required and available for string selects (type 3); max 25 */
  options: nullish(pipe(array(selectOptionSchema), maxLength(25))),
  /** List of channel types to include in the channel select component (type 8) */
  channelTypes: nullish(array(channelTypeSchema)),
  /** Placeholder text if nothing is selected; max 150 characters */
  placeholder: nullish(pipe(string(), maxLength(150))),
  /** List of default values for auto-populated select menu components; number of default values must be in the range defined by min_values and max_values */
  defaultValues: nullish(array(selectDefaultValueSchema)),
  /** Minimum number of items that must be chosen (defaults to 1); min 0, max 25 */
  minValues: nullish(pipe(number(), integer(), minValue(0), maxValue(25)), 1),
  /** Maximum number of items that can be chosen (defaults to 1); max 25 */
  maxValues: nullish(pipe(number(), integer(), minValue(0), maxValue(25)), 1),
  /** Whether select menu is disabled (defaults to false) */
  disabled: nullish(boolean(), false)
});

export type SelectMenu = InferOutput<typeof selectMenuSchema>;
