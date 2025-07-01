import {
  object,
  string,
  minLength,
  maxLength,
  type InferOutput,
  pipe
} from "valibot";

export const entityMetadataSchema = object({
  /** location of the event (1-100 characters) */
  location: pipe(string(), minLength(1), maxLength(100))
});

export interface EntityMetadata
  extends InferOutput<typeof entityMetadataSchema> {}
