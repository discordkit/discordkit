import { union, literal, type Output } from "valibot";

export const autoArchiveDurationSchema = union([
  literal(60),
  literal(1440),
  literal(4320),
  literal(10080)
]);

export type AutoArchiveDuration = Output<typeof autoArchiveDurationSchema>;
