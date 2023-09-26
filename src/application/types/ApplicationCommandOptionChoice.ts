import { z } from "zod";
import { localesSchema } from "./Locales";

export const applicationCommandOptionChoiceSchema = z.object({
  /** 1-100 character choice name */
  name: z.string().min(1).max(100),
  /** Localization dictionary for the name field. Values follow the same restrictions as name */
  nameLocalizations: z
    .record(localesSchema, z.string().min(1).max(100))
    .nullable()
    .optional(),
  /** Value for the choice, up to 100 characters if string */
  value: z.union([z.string().min(1).max(100), z.number().int(), z.number()])
});

export type ApplicationCommandOptionChoice = z.infer<
  typeof applicationCommandOptionChoiceSchema
>;
