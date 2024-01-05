import {
  object,
  string,
  minLength,
  maxLength,
  record,
  nullish,
  union,
  number,
  integer,
  type Output
} from "valibot";
import { localesSchema } from "./Locales.js";

export const applicationCommandOptionChoiceSchema = object({
  /** 1-100 character choice name */
  name: string([minLength(1), maxLength(100)]),
  /** Localization dictionary for the name field. Values follow the same restrictions as name */
  nameLocalizations: nullish(
    record(localesSchema, string([minLength(1), maxLength(100)]))
  ),
  /** Value for the choice, up to 100 characters if string */
  value: union([
    string([minLength(1), maxLength(100)]),
    number([integer()]),
    number()
  ])
});

export type ApplicationCommandOptionChoice = Output<
  typeof applicationCommandOptionChoiceSchema
>;
