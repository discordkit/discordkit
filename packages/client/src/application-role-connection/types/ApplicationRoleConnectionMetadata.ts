import * as v from "valibot";
import { boundedString } from "@discordkit/core";
import { applicationRoleConnectionMetadataTypeSchema } from "./ApplicationRoleConnectionMetadataType.js";
import { localesSchema } from "../../application/types/Locales.js";

export const applicationRoleConnectionMetadataSchema = v.object({
  /** type of metadata value */
  type: applicationRoleConnectionMetadataTypeSchema,
  /** dictionary key for the metadata field (must be `a-z`, `0-9`, or `_` characters; 1-50 characters) */
  key: v.pipe(
    v.string(),
    v.nonEmpty(),
    v.maxLength(50),
    v.regex(/^[a-z0-9_]*$/)
  ),
  /** name of the metadata field (1-100 characters) */
  name: boundedString({ max: 100 }),
  /** translations of the name */
  nameLocalizations: v.nullish(v.record(localesSchema, v.string())),
  /** description of the metadata field (1-200 characters) */
  description: boundedString({ max: 200 }),
  /** translations of the description */
  descriptionLocalizations: v.nullish(v.record(localesSchema, v.string()))
});

export interface ApplicationRoleConnectionMetadata
  extends v.InferOutput<typeof applicationRoleConnectionMetadataSchema> {}
