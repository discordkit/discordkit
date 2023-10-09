import { getAsset, snowflake } from "@discordkit/core";
import { type Output, object, optional, enumType } from "valibot";

export const stickerImageSchema = object({
  sticker: snowflake,
  format: optional(enumType([`png`, `json`, `gif`]), `png`)
});

export const sticker = ({
  sticker: id,
  format
}: Output<typeof stickerImageSchema>): string =>
  getAsset(`/stickers/${id}.${format ?? `png`}`);
