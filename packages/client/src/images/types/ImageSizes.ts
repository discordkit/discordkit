import { union, literal, type Output } from "valibot";

export const imageSizes = union([
  literal(16),
  literal(32),
  literal(64),
  literal(128),
  literal(256),
  literal(512),
  literal(1024),
  literal(2048),
  literal(4096)
]);

export type ImageSizes = Output<typeof imageSizes>;
