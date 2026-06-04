import * as v from "valibot";

/**
 * ### [Sticker Format Type](https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types)
 */
export enum StickerFormatType {
  PNG = 1,
  APNG = 2,
  LOTTIE = 3,
  GIF = 4
}

export const stickerFormatTypeSchema = v.enum_(StickerFormatType);
