import { getAsset, snowflake } from "@discordkit/core";
import { type InferOutput, picklist, object, exactOptional } from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const customEmojiSchema = object({
  emoji: snowflake,
  format: exactOptional(picklist([`png`, `jpg`, `webp`, `gif`])),
  params: exactOptional(
    object({
      size: imageSizes
    })
  )
});

export const customEmoji = ({
  emoji,
  format,
  params
}: InferOutput<typeof customEmojiSchema>): string =>
  getAsset(`/emojis/${emoji}.${format ?? `png`}`, params);
