import {
  object,
  string,
  maxLength,
  nullish,
  pick,
  boolean,
  type Output
} from "valibot";
import { emojiSchema } from "../../emoji/types/Emoji.js";

export const selectOptionSchema = object({
  /** User-facing name of the option; max 100 characters */
  label: string([maxLength(100)]),
  /** Dev-defined value of the option; max 100 characters */
  value: string([maxLength(100)]),
  /** Additional description of the option; max 100 characters */
  description: nullish(string([maxLength(100)])),
  /** id, name, and animated */
  emoji: nullish(pick(emojiSchema, [`id`, `name`, `animated`])),
  /** Will show this option as selected by default */
  default: nullish(boolean())
});

export type SelectOption = Output<typeof selectOptionSchema>;
