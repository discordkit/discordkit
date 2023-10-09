import { getAsset, snowflake } from "@discordkit/core";
import { type Output, enumType, object, optional } from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const customEmojiSchema = object({
  emoji: snowflake,
  format: optional(enumType([`png`, `jpg`, `webp`, `gif`]), `png`),
  params: optional(
    object({
      size: imageSizes
    })
  )
});

export const customEmoji = ({
  emoji,
  format,
  params
}: Output<typeof customEmojiSchema>): string =>
  getAsset(`/emojis/${emoji}.${format ?? `png`}`, params);
