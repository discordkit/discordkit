import { nonEmpty, object, pipe, string, type InferOutput } from "valibot";
import { snowflake } from "@discordkit/core";
import { stickerFormatTypeSchema } from "./StickerFormatType.js";

export const stickerItemSchema = object({
  /** id of the sticker */
  id: snowflake,
  /** name of the sticker */
  name: pipe(string(), nonEmpty()),
  /** type of sticker format */
  formatType: stickerFormatTypeSchema
});

export interface StickerItem extends InferOutput<typeof stickerItemSchema> {}
