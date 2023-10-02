import { z } from "zod";
import { emojiSchema } from "../../emoji/types/Emoji.ts";

export const selectOptionSchema = z.object({
  /** User-facing name of the option; max 100 characters */
  label: z.string().max(100),
  /** Dev-defined value of the option; max 100 characters */
  value: z.string().max(100),
  /** Additional description of the option; max 100 characters */
  description: z.string().max(100).nullish(),
  /** id, name, and animated */
  emoji: emojiSchema.pick({ id: true, name: true, animated: true }).nullish(),
  /** Will show this option as selected by default */
  default: z.boolean().nullish()
});

export type SelectOption = z.infer<typeof selectOptionSchema>;
