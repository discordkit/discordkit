import * as v from "valibot";

export enum StickerFormatType {
  PNG = 1,
  APNG = 2,
  LOTTIE = 3,
  GIF = 4
}

export const stickerFormatTypeSchema = v.enum_(StickerFormatType);
