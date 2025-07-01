import {
  object,
  string,
  maxLength,
  exactOptional,
  pick,
  boolean,
  pipe,
  nonEmpty,
  type InferOutput
} from "valibot";
import { emojiSchema } from "../../emoji/types/Emoji.js";

export const selectOptionSchema = object({
  /** User-facing name of the option; max 100 characters */
  label: pipe(string(), nonEmpty(), maxLength(100)),
  /** Dev-defined value of the option; max 100 characters */
  value: pipe(string(), nonEmpty(), maxLength(100)),
  /** Additional description of the option; max 100 characters */
  description: exactOptional(pipe(string(), nonEmpty(), maxLength(100))),
  /** id, name, and animated */
  emoji: exactOptional(pick(emojiSchema, [`id`, `name`, `animated`])),
  /** Will show this option as selected by default */
  default: exactOptional(boolean())
});

export interface SelectOption extends InferOutput<typeof selectOptionSchema> {}
