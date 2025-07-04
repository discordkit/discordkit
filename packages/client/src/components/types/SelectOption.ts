import * as v from "valibot";
import { boundedString } from "@discordkit/core";
import { emojiSchema } from "../../emoji/types/Emoji.js";

export const selectOptionSchema = v.object({
  /** User-facing name of the option; max 100 characters */
  label: boundedString({ max: 100 }),
  /** Dev-defined value of the option; max 100 characters */
  value: boundedString({ max: 100 }),
  /** Additional description of the option; max 100 characters */
  description: v.exactOptional(boundedString({ max: 100 })),
  /** id, name, and animated */
  emoji: v.exactOptional(
    v.object({
      id: emojiSchema.entries.id,
      name: emojiSchema.entries.name,
      animated: emojiSchema.entries.animated
    })
  ),
  /** Will show this option as selected by default */
  default: v.exactOptional(v.boolean())
});

export interface SelectOption
  extends v.InferOutput<typeof selectOptionSchema> {}
