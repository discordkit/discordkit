import * as v from "valibot";
import { getAsset, snowflake } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const customEmojiSchema = v.object({
  emoji: snowflake,
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`, `gif`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const customEmoji = ({
  emoji,
  format,
  params
}: v.InferOutput<typeof customEmojiSchema>): string =>
  getAsset(`/emojis/${emoji}.${format ?? `png`}`, params);
