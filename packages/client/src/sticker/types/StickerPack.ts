import * as v from "valibot";
import { snowflake, boundedString, schema } from "@discordkit/core";
import { stickerSchema } from "./Sticker.js";

const _stickerPackSchema = v.object({
  /** id of the sticker pack */
  id: snowflake,
  /** the stickers in the pack */
  stickers: v.array(stickerSchema),
  /** name of the sticker pack */
  name: boundedString(),
  /** id of the pack's SKU */
  skuId: snowflake,
  /** id of a sticker in the pack which is shown as the pack's icon */
  coverStickerId: v.exactOptional(snowflake),
  /** description of the sticker pack */
  description: boundedString(),
  /** id of the sticker pack's banner image */
  bannerAssetId: v.exactOptional(snowflake)
});

export interface StickerPack extends v.InferOutput<typeof _stickerPackSchema> {}

/**
 * ### [Sticker Pack](https://discord.com/developers/docs/resources/sticker#sticker-pack-object)
 *
 * Represents a pack of standard stickers.
 */
export const stickerPackSchema = schema<StickerPack>(_stickerPackSchema);
