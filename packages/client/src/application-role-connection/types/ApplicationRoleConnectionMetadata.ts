import {
  pipe,
  object,
  string,
  minLength,
  maxLength,
  regex,
  record,
  nullish,
  type InferOutput,
  type GenericSchema
} from "valibot";
import { applicationRoleConnectionMetadataTypeSchema } from "./ApplicationRoleConnectionMetadataType.js";
import { localesSchema } from "../../application/types/Locales.js";

export const applicationRoleConnectionMetadataSchema = object({
  /** type of metadata value */
  type: applicationRoleConnectionMetadataTypeSchema,
  /** dictionary key for the metadata field (must be `a-z`, `0-9`, or `_` characters; 1-50 characters) */
  key: pipe(
    string(),
    regex(/^[a-z0-9_]*$/),
    minLength(1),
    maxLength(50)
  ) as GenericSchema<string>,
  /** name of the metadata field (1-100 characters) */
  name: pipe(string(), minLength(1), maxLength(200)) as GenericSchema<string>,
  /** translations of the name */
  nameLocalizations: nullish(record(localesSchema, string())),
  /** description of the metadata field (1-200 characters) */
  description: pipe(
    string(),
    minLength(1),
    maxLength(200)
  ) as GenericSchema<string>,
  /** translations of the description */
  descriptionLocalizations: nullish(record(localesSchema, string()))
});

export interface ApplicationRoleConnectionMetadata
  extends InferOutput<typeof applicationRoleConnectionMetadataSchema> {}
