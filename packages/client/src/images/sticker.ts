import * as v from "valibot";
import { getAsset, snowflake } from "@discordkit/core";

export const stickerImageSchema = v.object({
  sticker: snowflake,
  format: v.exactOptional(v.picklist([`png`, `json`, `gif`]))
});

export const sticker = ({
  sticker: id,
  format
}: v.InferOutput<typeof stickerImageSchema>): string =>
  format === `gif`
    ? `https://media.discordapp.net/stickers/${id}.gif`
    : getAsset(`/stickers/${id}.${format ?? `png`}`);
