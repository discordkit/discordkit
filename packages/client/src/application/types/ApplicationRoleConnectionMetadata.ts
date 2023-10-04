import { z } from "zod";
import { applicationRoleConnectionMetadataTypeSchema } from "./ApplicationRoleConnectionMetadataType.js";
import { localesSchema } from "./Locales.js";

export const applicationRoleConnectionMetadataSchema = z.object({
  /** type of metadata value */
  type: applicationRoleConnectionMetadataTypeSchema,
  /** dictionary key for the metadata field (must be `a-z`, `0-9`, or `_` characters; 1-50 characters) */
  key: z
    .string()
    .min(1)
    .max(50)
    .regex(/[a-z0-9_]/),
  /** name of the metadata field (1-100 characters) */
  name: z.string().min(1).max(100),
  /** translations of the name */
  nameLocalizations: z.record(localesSchema, z.string()).nullish(),
  /** description of the metadata field (1-200 characters) */
  description: z.string().min(1).max(200),
  /** translations of the description */
  descriptionLocalizations: z.record(localesSchema, z.string()).nullish()
});

export type ApplicationRoleConnectionMetadata = z.infer<
  typeof applicationRoleConnectionMetadataSchema
>;
