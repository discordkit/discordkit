import * as v from "valibot";

/**
 * ### [Dynamic Field Types](https://discord.com/developers/docs/resources/application-identity-profile#dynamic-field-object-dynamic-field-types)
 */
export enum DynamicFieldType {
  /** a text value */
  STRING = 1,
  /** a numeric value */
  NUMBER = 2,
  /** a media object (image URL) */
  MEDIA = 3
}

export const dynamicFieldTypeSchema = v.enum_(DynamicFieldType);
