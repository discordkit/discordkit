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
  type InferOutput,
  pipe
} from "valibot";
import { localesSchema } from "../../application/types/Locales.js";

export const applicationCommandOptionChoiceSchema = object({
  /** 1-100 character choice name */
  name: pipe(string(), minLength(1), maxLength(100)),
  /** Localization dictionary for the name field. Values follow the same restrictions as name */
  nameLocalizations: nullish(
    record(localesSchema, pipe(string(), minLength(1), maxLength(100)))
  ),
  /** Value for the choice, up to 100 characters if string */
  value: union([
    pipe(string(), minLength(1), maxLength(100)),
    pipe(number(), integer()),
    number()
  ])
});

export type ApplicationCommandOptionChoice = InferOutput<
  typeof applicationCommandOptionChoiceSchema
>;
