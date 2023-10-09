import {
  object,
  string,
  minLength,
  maxLength,
  nullish,
  type Output
} from "valibot";

export const entityMetadataSchema = object({
  /** location of the event (1-100 characters) */
  location: nullish(string([minLength(1), maxLength(100)]))
});

export type EntityMetadata = Output<typeof entityMetadataSchema>;
