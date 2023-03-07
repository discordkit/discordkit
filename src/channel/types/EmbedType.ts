import { z } from "zod";

export const embedType = z.enum([
  /** generic embed rendered from embed attributes */
  `rich`,
  /** image embed */
  `image`,
  /** video embed */
  `video`,
  /** animated gif image embed rendered as a video embed */
  `gifv`,
  /** article embed */
  `article`,
  /** link embed */
  `link`
]);

export type EmbedType = z.infer<typeof embedType>;
