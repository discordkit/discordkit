import { getAsset, snowflake } from "@discordkit/core";
import { type Output, picklist, object, optional } from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const customEmojiSchema = object({
  emoji: snowflake,
  format: optional(picklist([`png`, `jpg`, `webp`, `gif`]), `png`),
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
