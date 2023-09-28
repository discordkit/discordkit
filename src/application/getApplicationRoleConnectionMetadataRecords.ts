import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import {
  type ApplicationRoleConnectionMetadata,
  applicationRoleConnectionMetadataSchema
} from "./types/ApplicationRoleConnectionMetadata.ts";

export const getApplicationRoleConnectionMetadataRecordsSchema = z.object({
  application: z.string().min(1)
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

export const getApplicationRoleConnectionMetadataRecordsProcedure = toProcedure(
  `query`,
  getApplicationRoleConnectionMetadataRecords,
  getApplicationRoleConnectionMetadataRecordsSchema,
  applicationRoleConnectionMetadataSchema.array()
);

export const getApplicationRoleConnectionMetadataRecordsQuery = toQuery(
  getApplicationRoleConnectionMetadataRecords
);
