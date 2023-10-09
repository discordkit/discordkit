import {
  object,
  literal,
  string,
  maxLength,
  nullish,
  pick,
  url,
  boolean,
  type Output
} from "valibot";
import { emojiSchema } from "../../emoji/types/Emoji.js";
import { buttonStyleSchema } from "./ButtonStyle.js";
import { ComponentType } from "./ComponentType.js";

export const buttonSchema = object({
  /** 2 for a button */
  type: literal(ComponentType.Button),
  /** A button style */
  style: buttonStyleSchema,
  /** Text that appears on the button; max 80 characters */
  label: nullish(string([maxLength(80)])),
  /** name, id, and animated */
  emoji: nullish(pick(emojiSchema, [`id`, `name`, `animated`])),
  /** Developer-defined identifier for the button; max 100 characters */
  customId: nullish(string([maxLength(100)])),
  /** URL for link-style buttons */
  url: nullish(string([url()])),
  /** Whether the button is disabled (defaults to false) */
  disabled: nullish(boolean(), false)
});

export type Button = Output<typeof buttonSchema>;
