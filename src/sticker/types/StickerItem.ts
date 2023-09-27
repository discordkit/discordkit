import { z } from "zod";
import { stickerFormatTypeSchema } from "./StickerFormatType";

export const stickerItemSchema = z.object({
  /** id of the sticker */
  id: z.string().min(1),
  /** name of the sticker */
  name: z.string().min(1),
  /** type of sticker format */
  formatType: stickerFormatTypeSchema
});

export type StickerItem = z.infer<typeof stickerItemSchema>;
