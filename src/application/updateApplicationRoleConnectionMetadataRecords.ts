import { z } from "zod";
import { type Fetcher, toProcedure, put } from "../utils";
import {
  type ApplicationRoleConnectionMetadata,
  applicationRoleConnectionMetadataSchema
} from "./types/ApplicationRoleConnectionMetadata";

export const updateApplicationRoleConnectionMetadataRecordsSchema = z.object({
  application: z.string().min(1),
  body: z.object({
    records: applicationRoleConnectionMetadataSchema.array()
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

export const updateApplicationRoleConnectionMetadataRecordsProcedure =
  toProcedure(
    `mutation`,
    updateApplicationRoleConnectionMetadataRecords,
    updateApplicationRoleConnectionMetadataRecordsSchema,
    applicationRoleConnectionMetadataSchema.array()
  );
