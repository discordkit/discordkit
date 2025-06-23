import { minLength, object, pipe, string, type InferOutput } from "valibot";
import { snowflake } from "@discordkit/core";
import { stickerFormatTypeSchema } from "./StickerFormatType.js";

export const stickerItemSchema = object({
  /** id of the sticker */
  id: snowflake,
  /** name of the sticker */
  name: pipe(string(), minLength(1)),
  /** type of sticker format */
  formatType: stickerFormatTypeSchema
});

export type StickerItem = InferOutput<typeof stickerItemSchema>;
