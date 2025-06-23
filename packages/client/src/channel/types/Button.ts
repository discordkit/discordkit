import {
  object,
  literal,
  string,
  maxLength,
  nullish,
  pick,
  url,
  boolean,
  type InferOutput,
  pipe
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
  label: nullish(pipe(string(), maxLength(80))),
  /** name, id, and animated */
  emoji: nullish(pick(emojiSchema, [`id`, `name`, `animated`])),
  /** Developer-defined identifier for the button; max 100 characters */
  customId: nullish(pipe(string(), maxLength(100))),
  /** URL for link-style buttons */
  url: nullish(pipe(string(), url())),
  /** Whether the button is disabled (defaults to false) */
  disabled: nullish(boolean(), false)
});

export type Button = InferOutput<typeof buttonSchema>;
