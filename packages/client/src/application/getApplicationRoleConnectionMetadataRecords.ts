import { array, object } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  type ApplicationRoleConnectionMetadata,
  applicationRoleConnectionMetadataSchema
} from "./types/ApplicationRoleConnectionMetadata.js";

export const getApplicationRoleConnectionMetadataRecordsSchema = object({
  application: snowflake
});

/**
 * ### [Get Application Role Connection Metadata Records](https://discord.com/developers/docs/resources/application-role-connection-metadata#get-application-role-connection-metadata-records)
 *
 * **GET** `/applications/:application/role-connections/metadata`
 *
 * Returns a list of {@link ApplicationRoleConnectionMetadata | application role connection metadata objects} for the given application.
 */
export const getApplicationRoleConnectionMetadataRecords: Fetcher<
  typeof getApplicationRoleConnectionMetadataRecordsSchema,
  ApplicationRoleConnectionMetadata[]
> = async ({ application }) =>
  get(`/applications/${application}/role-connections/metadata`);

export const getApplicationRoleConnectionMetadataRecordsSafe = toValidated(
  getApplicationRoleConnectionMetadataRecords,
  getApplicationRoleConnectionMetadataRecordsSchema,
  array(applicationRoleConnectionMetadataSchema)
);

export const getApplicationRoleConnectionMetadataRecordsProcedure = toProcedure(
  `query`,
  getApplicationRoleConnectionMetadataRecords,
  getApplicationRoleConnectionMetadataRecordsSchema,
  array(applicationRoleConnectionMetadataSchema)
);

export const getApplicationRoleConnectionMetadataRecordsQuery = toQuery(
  getApplicationRoleConnectionMetadataRecords
);
