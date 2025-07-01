import * as v from "valibot";
import { emojiSchema } from "../../emoji/types/Emoji.js";

export const selectOptionSchema = v.object({
  /** User-facing name of the option; max 100 characters */
  label: v.pipe(v.string(), v.nonEmpty(), v.maxLength(100)),
  /** Dev-defined value of the option; max 100 characters */
  value: v.pipe(v.string(), v.nonEmpty(), v.maxLength(100)),
  /** Additional description of the option; max 100 characters */
  description: v.exactOptional(
    v.pipe(v.string(), v.nonEmpty(), v.maxLength(100))
  ),
  /** id, name, and animated */
  emoji: v.exactOptional(v.pick(emojiSchema, [`id`, `name`, `animated`])),
  /** Will show this option as selected by default */
  default: v.exactOptional(v.boolean())
});

export interface SelectOption
  extends v.InferOutput<typeof selectOptionSchema> {}
