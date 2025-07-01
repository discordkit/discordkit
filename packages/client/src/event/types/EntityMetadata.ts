import * as v from "valibot";

export const entityMetadataSchema = v.object({
  /** location of the event (1-100 characters) */
  location: v.pipe(v.string(), v.minLength(1), v.maxLength(100))
});

export interface EntityMetadata
  extends v.InferOutput<typeof entityMetadataSchema> {}
