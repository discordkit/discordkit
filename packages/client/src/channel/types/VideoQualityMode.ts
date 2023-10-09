import { nativeEnum } from "valibot";

export enum VideoQualityMode {
  /** Discord chooses the quality for optimal performance */
  AUTO = 1,
  /** 720p */
  FULL = 2
}

export const videoQualityModeSchema = nativeEnum(VideoQualityMode);
