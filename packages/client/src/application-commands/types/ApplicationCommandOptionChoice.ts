import * as v from "valibot";
import { localesSchema } from "../../application/types/Locales.js";

export const applicationCommandOptionChoiceSchema = v.object({
  /** 1-100 character choice name */
  name: v.pipe(
    v.string(),
    v.minLength(1),
    v.maxLength(100)
  ) as v.GenericSchema<string>,
  /** Localization dictionary for the name field. Values follow the same restrictions as name */
  nameLocalizations: v.nullish(
    v.record(
      localesSchema,
      v.pipe(
        v.string(),
        v.minLength(1),
        v.maxLength(100)
      ) as v.GenericSchema<string>
    )
  ),
  /** Value for the choice, up to 100 characters if string */
  value: v.union([
    v.pipe(
      v.string(),
      v.minLength(1),
      v.maxLength(100)
    ) as v.GenericSchema<string>,
    v.pipe(v.number(), v.integer()) as v.GenericSchema<number>,
    v.number()
  ])
});

export interface ApplicationCommandOptionChoice
  extends v.InferOutput<typeof applicationCommandOptionChoiceSchema> {}
