import { getAsset, snowflake } from "@discordkit/core";
import { type Output, object, optional, picklist } from "valibot";

export const stickerImageSchema = object({
  sticker: snowflake,
  format: optional(picklist([`png`, `json`, `gif`]), `png`)
});

export const sticker = ({
  sticker: id,
  format
}: Output<typeof stickerImageSchema>): string =>
  getAsset(`/stickers/${id}.${format ?? `png`}`);
