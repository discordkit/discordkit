import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { stickerFormatTypeSchema } from "./StickerFormatType.js";

export const stickerItemSchema = z.object({
  /** id of the sticker */
  id: snowflake,
  /** name of the sticker */
  name: z.string().min(1),
  /** type of sticker format */
  formatType: stickerFormatTypeSchema
});

export type StickerItem = z.infer<typeof stickerItemSchema>;
