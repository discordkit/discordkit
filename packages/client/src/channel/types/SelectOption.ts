import {
  object,
  string,
  maxLength,
  nullish,
  pick,
  boolean,
  type InferOutput,
  pipe
} from "valibot";
import { emojiSchema } from "../../emoji/types/Emoji.js";

export const selectOptionSchema = object({
  /** User-facing name of the option; max 100 characters */
  label: pipe(string(), maxLength(100)),
  /** Dev-defined value of the option; max 100 characters */
  value: pipe(string(), maxLength(100)),
  /** Additional description of the option; max 100 characters */
  description: nullish(pipe(string(), maxLength(100))),
  /** id, name, and animated */
  emoji: nullish(pick(emojiSchema, [`id`, `name`, `animated`])),
  /** Will show this option as selected by default */
  default: nullish(boolean())
});

export type SelectOption = InferOutput<typeof selectOptionSchema>;
