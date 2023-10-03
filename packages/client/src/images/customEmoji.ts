import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.ts";

export const customEmojiSchema = z.object({
  emoji: snowflake,
  format: z
    .union([
      z.literal(`png`),
      z.literal(`jpg`),
      z.literal(`webp`),
      z.literal(`gif`)
    ])
    .optional()
    .default(`png`),
  params: z
    .object({
      size: imageSizes
    })
    .optional()
});

export const customEmoji = ({
  emoji,
  format,
  params
}: z.infer<typeof customEmojiSchema>): string =>
  getAsset(`/emojis/${emoji}.${format}`, params);
