import { nativeEnum } from "valibot";

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
  LINK = `link`
}

export const embedTypeSchema = nativeEnum(EmbedType);
