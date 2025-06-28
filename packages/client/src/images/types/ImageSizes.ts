import { picklist, type InferOutput } from "valibot";

export const imageSizes = picklist([
  16, 32, 64, 128, 256, 512, 1024, 2048, 4096
]);

export type ImageSizes = InferOutput<typeof imageSizes>;
