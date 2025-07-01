import * as v from "valibot";

export const autoArchiveDurationSchema = v.picklist([60, 1440, 4320, 10080]);

export type AutoArchiveDuration = v.InferOutput<
  typeof autoArchiveDurationSchema
>;
