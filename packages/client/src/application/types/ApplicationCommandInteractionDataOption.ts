import {
  array,
  boolean,
  integer,
  nonEmpty,
  number,
  object,
  pipe,
  lazy,
  string,
  union,
  type InferOutput,
  exactOptional
} from "valibot";
import { applicationCommandOptionTypeSchema } from "./ApplicationCommandOptionType.js";

const base = object({
  /** Name of the parameter */
  name: pipe(string(), nonEmpty()),
  /** Value of application command option type */
  type: applicationCommandOptionTypeSchema,
  /** Value of the option resulting from user input */
  value: exactOptional(
    union([string(), pipe(number(), integer()), number(), boolean()])
  ),
  /** true if this option is the currently focused option for autocomplete */
  focused: exactOptional(boolean())
});

export const applicationCommandInteractionDataOptionSchema = object({
  ...base.entries,
  /** Present if this option is a group or subcommand */
  options: exactOptional(lazy(() => array(base)))
});

export type ApplicationCommandInteractionDataOption = InferOutput<
  typeof applicationCommandInteractionDataOptionSchema
>;
