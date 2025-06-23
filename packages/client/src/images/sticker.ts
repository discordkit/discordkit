import { getAsset, snowflake } from "@discordkit/core";
import { type InferOutput, object, exactOptional, picklist } from "valibot";

export const stickerImageSchema = object({
  sticker: snowflake,
  format: exactOptional(picklist([`png`, `json`, `gif`]))
});

export const sticker = ({
  sticker: id,
  format
}: InferOutput<typeof stickerImageSchema>): string =>
  getAsset(`/stickers/${id}.${format ?? `png`}`);
