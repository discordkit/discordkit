import * as v from "valibot";
import { boundedString, boundedInteger } from "@discordkit/core";
import type { Locales } from "../../application/types/Locales.js";
import { localesSchema } from "../../application/types/Locales.js";

export const applicationCommandOptionChoiceSchema = v.object({
  /** 1-100 character choice name */
  name: boundedString({ max: 100 }),
  /** Localization dictionary for the name field. Values follow the same restrictions as name */
  nameLocalizations: v.nullish(
    v.record(localesSchema, boundedString({ max: 100 })) as v.GenericSchema<
      Record<Locales, string>
    >
  ),
  /** Value for the choice, up to 100 characters if string */
  value: v.union([boundedString({ max: 100 }), boundedInteger(), v.number()])
});

export interface ApplicationCommandOptionChoice
  extends v.InferOutput<typeof applicationCommandOptionChoiceSchema> {}
