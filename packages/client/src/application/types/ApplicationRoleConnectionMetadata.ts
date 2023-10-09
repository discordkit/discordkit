import {
  object,
  string,
  minLength,
  maxLength,
  regex,
  record,
  nullish,
  type Output
} from "valibot";
import { applicationRoleConnectionMetadataTypeSchema } from "./ApplicationRoleConnectionMetadataType.js";
import { localesSchema } from "./Locales.js";

export const applicationRoleConnectionMetadataSchema = object({
  /** type of metadata value */
  type: applicationRoleConnectionMetadataTypeSchema,
  /** dictionary key for the metadata field (must be `a-z`, `0-9`, or `_` characters; 1-50 characters) */
  key: string([minLength(1), maxLength(50), regex(/[a-z0-9_]/)]),
  /** name of the metadata field (1-100 characters) */
  name: string([minLength(1), maxLength(200)]),
  /** translations of the name */
  nameLocalizations: nullish(record(localesSchema, string())),
  /** description of the metadata field (1-200 characters) */
  description: string([minLength(1), maxLength(200)]),
  /** translations of the description */
  descriptionLocalizations: nullish(record(localesSchema, string()))
});

export type ApplicationRoleConnectionMetadata = Output<
  typeof applicationRoleConnectionMetadataSchema
>;
