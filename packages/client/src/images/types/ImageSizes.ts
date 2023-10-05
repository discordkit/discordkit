import { z } from "zod";

export const imageSizes = z.union([
  z.literal(16),
  z.literal(32),
  z.literal(64),
  z.literal(128),
  z.literal(256),
  z.literal(512),
  z.literal(1024),
  z.literal(2048),
  z.literal(4096)
]);

export type ImageSizes = z.infer<typeof imageSizes>;
