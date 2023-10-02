import { z } from "zod";
import { emojiSchema } from "../../emoji/types/Emoji.ts";
import { buttonStyleSchema } from "./ButtonStyle.ts";
import { ComponentType } from "./ComponentType.ts";

export const buttonSchema = z.object({
  /** 2 for a button */
  type: z.literal(ComponentType.Button),
  /** A button style */
  style: buttonStyleSchema,
  /** Text that appears on the button; max 80 characters */
  label: z.string().max(80).nullish(),
  /** name, id, and animated */
  emoji: emojiSchema.pick({ id: true, name: true, animated: true }).nullish(),
  /** Developer-defined identifier for the button; max 100 characters */
  customId: z.string().max(100).nullish(),
  /** URL for link-style buttons */
  url: z.string().url().nullish(),
  /** Whether the button is disabled (defaults to false) */
  disabled: z.boolean().nullish().default(false)
});

export type Button = z.infer<typeof buttonSchema>;
