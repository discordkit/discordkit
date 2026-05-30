import * as v from "valibot";
import { snowflake, boundedString } from "@discordkit/core";
import { stickerFormatTypeSchema } from "./StickerFormatType.js";

/**
 * ### [Sticker Item](https://discord.com/developers/docs/resources/sticker#sticker-item-object)
 *
 * The smallest amount of data required to render a sticker. A partial sticker object.
 */
export const stickerItemSchema = v.object({
  /** id of the sticker */
  id: snowflake,
  /** name of the sticker */
  name: boundedString({ min: 2, max: 30 }),
  /** type of sticker format */
  formatType: stickerFormatTypeSchema
});

export interface StickerItem extends v.InferOutput<typeof stickerItemSchema> {}
