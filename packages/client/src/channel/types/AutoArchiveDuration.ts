import { picklist, type InferOutput } from "valibot";

export const autoArchiveDurationSchema = picklist([60, 1440, 4320, 10080]);

export type AutoArchiveDuration = InferOutput<typeof autoArchiveDurationSchema>;
