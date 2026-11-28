import * as v from "valibot";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { partialSchema, pickFields } from "@discordkit/core/validations/schema";
import { emojiSchema } from "../../emoji/types/Emoji.js";

export const selectOptionSchema = v.object({
  /** User-facing name of the option; max 100 characters */
  label: boundedString({ max: 100 }),
  /** Dev-defined value of the option; max 100 characters */
  value: boundedString({ max: 100 }),
  /** Additional description of the option; max 100 characters */
  description: v.exactOptional(boundedString({ max: 100 })),
  /** A partial emoji: `id`, `name`, and `animated`, each optional. A Unicode emoji needs only its `name`. */
  emoji: v.exactOptional(
    partialSchema(pickFields(emojiSchema, [`id`, `name`, `animated`]))
  ),
  /** Will show this option as selected by default */
  default: v.exactOptional(v.boolean())
});

export interface SelectOption extends v.InferOutput<
  typeof selectOptionSchema
> {}
