import * as v from "valibot";

export enum EmbedType {
  /** generic embed rendered from embed attributes */
  RICH = `rich`,
  /** image embed */
  IMAGE = `image`,
  /** video embed */
  VIDEO = `video`,
  /** animated gif image embed rendered as a video embed */
  GIF = `gifv`,
  /** article embed */
  ARTICLE = `article`,
  /** link embed */
  LINK = `link`,
  /** poll result embed */
  POLL_RESULT = `poll_result`
}

export const embedTypeSchema = v.enum_(EmbedType);
