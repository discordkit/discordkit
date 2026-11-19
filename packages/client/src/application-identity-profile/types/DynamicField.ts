import * as v from "valibot";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema } from "@discordkit/core/validations/schema";
import { DynamicFieldType } from "./DynamicFieldType.js";
import { profileMediaSchema } from "./ProfileMedia.js";

const _dynamicStringFieldSchema = v.object({
  /** `1`, identifies a string field */
  type: v.literal(DynamicFieldType.STRING),
  /** the field name (max 100 characters) */
  name: boundedString({ max: 100 }),
  /** the text value */
  value: v.string()
});

export interface DynamicStringField extends v.InferOutput<
  typeof _dynamicStringFieldSchema
> {}

/**
 * ### [Dynamic String Field](https://discord.com/developers/docs/resources/application-identity-profile#dynamic-field-object-dynamic-string-field-structure)
 */
export const dynamicStringFieldSchema = schema<DynamicStringField>(
  _dynamicStringFieldSchema
);

const _dynamicNumberFieldSchema = v.object({
  /** `2`, identifies a number field */
  type: v.literal(DynamicFieldType.NUMBER),
  /** the field name (max 100 characters) */
  name: boundedString({ max: 100 }),
  /** the numeric value */
  value: v.number()
});

export interface DynamicNumberField extends v.InferOutput<
  typeof _dynamicNumberFieldSchema
> {}

/**
 * ### [Dynamic Number Field](https://discord.com/developers/docs/resources/application-identity-profile#dynamic-field-object-dynamic-number-field-structure)
 */
export const dynamicNumberFieldSchema = schema<DynamicNumberField>(
  _dynamicNumberFieldSchema
);

const _dynamicMediaFieldSchema = v.object({
  /** `3`, identifies a media field */
  type: v.literal(DynamicFieldType.MEDIA),
  /** the field name (max 100 characters) */
  name: boundedString({ max: 100 }),
  /** the media value */
  value: profileMediaSchema
});

export interface DynamicMediaField extends v.InferOutput<
  typeof _dynamicMediaFieldSchema
> {}

/**
 * ### [Dynamic Media Field](https://discord.com/developers/docs/resources/application-identity-profile#dynamic-field-object-dynamic-media-field-structure)
 */
export const dynamicMediaFieldSchema = schema<DynamicMediaField>(
  _dynamicMediaFieldSchema
);

export type DynamicField =
  | DynamicStringField
  | DynamicNumberField
  | DynamicMediaField;

/**
 * ### [Dynamic Field](https://discord.com/developers/docs/resources/application-identity-profile#dynamic-field-object)
 *
 * Dynamic fields let you specify custom stats when the pre-configured primary fields don't cover your needs. Discriminated by `type`: {@link DynamicStringField}, {@link DynamicNumberField} or {@link DynamicMediaField}. The `name` is the data key you reference in the widget editor when configuring a **User Data** field. It is not shown to players; display labels are configured on the widget's fields in the editor.
 */
export const dynamicFieldSchema = v.variant(`type`, [
  _dynamicStringFieldSchema,
  _dynamicNumberFieldSchema,
  _dynamicMediaFieldSchema
]) as v.GenericSchema<DynamicField>;
