import * as v from "valibot";

/**
 * ### [Video Quality Mode](https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes)
 */
export enum VideoQualityMode {
  /** Discord chooses the quality for optimal performance */
  AUTO = 1,
  /** 720p */
  FULL = 2
}

export const videoQualityModeSchema = v.enum_(VideoQualityMode);
