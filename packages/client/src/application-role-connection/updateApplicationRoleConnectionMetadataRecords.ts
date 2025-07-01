import * as v from "valibot";
import {
  type Fetcher,
  toProcedure,
  put,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  type ApplicationRoleConnectionMetadata,
  applicationRoleConnectionMetadataSchema
} from "./types/ApplicationRoleConnectionMetadata.js";

export const updateApplicationRoleConnectionMetadataRecordsSchema = v.object({
  application: snowflake,
  body: v.object({
    records: v.array(applicationRoleConnectionMetadataSchema)
  })
});

/**
 * ### [Update Application Role Connection Metadata Records](https://discord.com/developers/docs/resources/application-role-connection-metadata#update-application-role-connection-metadata-records)
 *
 * **PUT** `/applications/:application/role-connections/metadata`
 *
 * Updates and returns a list of {@link ApplicationRoleConnectionMetadata | application role connection metadata objects }for the given application.
 */
export const updateApplicationRoleConnectionMetadataRecords: Fetcher<
  typeof updateApplicationRoleConnectionMetadataRecordsSchema,
  ApplicationRoleConnectionMetadata[]
> = async ({ application, body }) =>
  put(`/applications/${application}/role-connections/metadata`, body);

export const updateApplicationRoleConnectionMetadataRecordsSafe = toValidated(
  updateApplicationRoleConnectionMetadataRecords,
  updateApplicationRoleConnectionMetadataRecordsSchema,
  v.array(applicationRoleConnectionMetadataSchema)
);

export const updateApplicationRoleConnectionMetadataRecordsProcedure =
  toProcedure(
    `mutation`,
    updateApplicationRoleConnectionMetadataRecords,
    updateApplicationRoleConnectionMetadataRecordsSchema,
    v.array(applicationRoleConnectionMetadataSchema)
  );
