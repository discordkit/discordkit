import * as v from "valibot";

export const imageSizes = v.picklist([
  16, 32, 64, 128, 256, 512, 1024, 2048, 4096
]);

export type ImageSizes = v.InferOutput<typeof imageSizes>;
