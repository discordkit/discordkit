import { z } from "zod";

export const autoArchiveDurationSchema = z.union([
  z.literal(60),
  z.literal(1440),
  z.literal(4320),
  z.literal(10080)
]);

export type AutoArchiveDuration = z.infer<typeof autoArchiveDurationSchema>;
