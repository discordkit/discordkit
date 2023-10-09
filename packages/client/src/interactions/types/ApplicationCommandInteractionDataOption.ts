import {
  array,
  boolean,
  integer,
  merge,
  minLength,
  nullish,
  number,
  object,
  recursive,
  string,
  union,
  type Output
} from "valibot";
import { applicationCommandOptionTypeSchema } from "../../application/types/ApplicationCommandOptionType.js";

const base = object({
  /** Name of the parameter */
  name: string([minLength(1)]),
  /** Value of application command option type */
  type: applicationCommandOptionTypeSchema,
  /** Value of the option resulting from user input */
  value: nullish(union([string(), number([integer()]), number(), boolean()])),
  /** true if this option is the currently focused option for autocomplete */
  focused: nullish(boolean())
});

export const applicationCommandInteractionDataOptionSchema = merge([
  base,
  object({
    /** Present if this option is a group or subcommand */
    options: recursive(() => nullish(array(base)))
  })
]);

export type ApplicationCommandInteractionDataOption = Output<
  typeof applicationCommandInteractionDataOptionSchema
>;
