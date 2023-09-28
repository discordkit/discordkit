import { z } from "zod";
import { applicationCommandOptionTypeSchema } from "#/application/types/ApplicationCommandOptionType.ts";

const base = z.object({
  /** Name of the parameter */
  name: z.string().min(1),
  /** Value of application command option type */
  type: applicationCommandOptionTypeSchema,
  /** Value of the option resulting from user input */
  value: z
    .union([z.string(), z.number().int(), z.number(), z.boolean()])
    .nullable(),
  /** true if this option is the currently focused option for autocomplete */
  focused: z.boolean().nullable()
});

type Base = z.infer<typeof base> & {
  options: Base[] | null;
};

export const applicationCommandInteractionDataOptionSchema: z.ZodType<Base> =
  base.extend({
    /** Present if this option is a group or subcommand */
    options: z.lazy<z.ZodType<Base[] | null>>(
      () => base.array().nullable() as z.ZodType<Base[] | null>
    )
  });

export type ApplicationCommandInteractionDataOption = z.infer<
  typeof applicationCommandInteractionDataOptionSchema
>;
