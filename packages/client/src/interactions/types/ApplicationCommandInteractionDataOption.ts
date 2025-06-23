import {
  array,
  boolean,
  integer,
  nonEmpty,
  nullish,
  number,
  object,
  pipe,
  lazy,
  string,
  union,
  type InferOutput
} from "valibot";
import { applicationCommandOptionTypeSchema } from "../../application/types/ApplicationCommandOptionType.js";

const base = object({
  /** Name of the parameter */
  name: pipe(string(), nonEmpty()),
  /** Value of application command option type */
  type: applicationCommandOptionTypeSchema,
  /** Value of the option resulting from user input */
  value: nullish(
    union([string(), pipe(number(), integer()), number(), boolean()])
  ),
  /** true if this option is the currently focused option for autocomplete */
  focused: nullish(boolean())
});

export const applicationCommandInteractionDataOptionSchema = object({
  ...base.entries,
  /** Present if this option is a group or subcommand */
  options: lazy(() => nullish(array(base)))
});

export type ApplicationCommandInteractionDataOption = InferOutput<
  typeof applicationCommandInteractionDataOptionSchema
>;
