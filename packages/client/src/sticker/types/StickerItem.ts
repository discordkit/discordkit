import { minLength, object, string, type Output } from "valibot";
import { snowflake } from "@discordkit/core";
import { stickerFormatTypeSchema } from "./StickerFormatType.js";

export const stickerItemSchema = object({
  /** id of the sticker */
  id: snowflake,
  /** name of the sticker */
  name: string([minLength(1)]),
  /** type of sticker format */
  formatType: stickerFormatTypeSchema
});

export type StickerItem = Output<typeof stickerItemSchema>;
