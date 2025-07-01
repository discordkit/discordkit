import * as v from "valibot";
import { applicationRoleConnectionMetadataTypeSchema } from "./ApplicationRoleConnectionMetadataType.js";
import { localesSchema } from "../../application/types/Locales.js";

export const applicationRoleConnectionMetadataSchema = v.object({
  /** type of metadata value */
  type: applicationRoleConnectionMetadataTypeSchema,
  /** dictionary key for the metadata field (must be `a-z`, `0-9`, or `_` characters; 1-50 characters) */
  key: v.pipe(
    v.string(),
    v.regex(/^[a-z0-9_]*$/),
    v.minLength(1),
    v.maxLength(50)
  ) as v.GenericSchema<string>,
  /** name of the metadata field (1-100 characters) */
  name: v.pipe(
    v.string(),
    v.minLength(1),
    v.maxLength(200)
  ) as v.GenericSchema<string>,
  /** translations of the name */
  nameLocalizations: v.nullish(v.record(localesSchema, v.string())),
  /** description of the metadata field (1-200 characters) */
  description: v.pipe(
    v.string(),
    v.minLength(1),
    v.maxLength(200)
  ) as v.GenericSchema<string>,
  /** translations of the description */
  descriptionLocalizations: v.nullish(v.record(localesSchema, v.string()))
});

export interface ApplicationRoleConnectionMetadata
  extends v.InferOutput<typeof applicationRoleConnectionMetadataSchema> {}
