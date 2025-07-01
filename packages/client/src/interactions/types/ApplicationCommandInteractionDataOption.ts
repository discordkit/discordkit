import * as v from "valibot";
import { applicationCommandOptionTypeSchema } from "../../application-commands/types/ApplicationCommandOptionType.js";

const base = v.object({
  /** Name of the parameter */
  name: v.pipe(v.string(), v.nonEmpty()),
  /** Value of application command option type */
  type: applicationCommandOptionTypeSchema,
  /** Value of the option resulting from user input */
  value: v.exactOptional(
    v.union([
      v.string(),
      v.pipe(v.number(), v.integer()),
      v.number(),
      v.boolean()
    ])
  ),
  /** true if this option is the currently focused option for autocomplete */
  focused: v.exactOptional(v.boolean())
});

export const applicationCommandInteractionDataOptionSchema = v.object({
  ...base.entries,
  /** Present if this option is a group or subcommand */
  options: v.exactOptional(v.lazy(() => v.array(base)))
});

export interface ApplicationCommandInteractionDataOption
  extends v.InferOutput<typeof applicationCommandInteractionDataOptionSchema> {}
