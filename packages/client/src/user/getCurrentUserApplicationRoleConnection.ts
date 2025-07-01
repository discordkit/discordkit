import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  type ApplicationRoleConnection,
  applicationRoleConnectionSchema
} from "./types/ApplicationRoleConnection.js";

export const getCurrentUserApplicationRoleConnectionSchema = v.object({
  application: snowflake
});

/**
 * ### [Get Current User Application Role Connection](https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection)
 *
 * **GET** `/users/@me/applications/:application/role-connection`
 *
 * Returns the {@link ApplicationRoleConnection | application role connection} for the user. Requires an OAuth2 access token with role_connections.write scope for the application specified in the path.
 */
export const getCurrentUserApplicationRoleConnection: Fetcher<
  typeof getCurrentUserApplicationRoleConnectionSchema,
  ApplicationRoleConnection
> = async ({ application }) =>
  get(`/users/@me/applications/${application}/role-connection`);

export const getCurrentUserApplicationRoleConnectionSafe = toValidated(
  getCurrentUserApplicationRoleConnection,
  getCurrentUserApplicationRoleConnectionSchema,
  applicationRoleConnectionSchema
);

export const getCurrentUserApplicationRoleConnectionProcedure = toProcedure(
  `query`,
  getCurrentUserApplicationRoleConnection,
  getCurrentUserApplicationRoleConnectionSchema,
  applicationRoleConnectionSchema
);

export const getCurrentUserApplicationRoleConnectionQuery = toQuery(
  getCurrentUserApplicationRoleConnection
);
