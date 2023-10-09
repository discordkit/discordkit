import { object } from "valibot";
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
} from "../application/types/ApplicationRoleConnection.js";

export const getUserApplicationRoleConnectionSchema = object({
  application: snowflake
});

/**
 * ### [Get User Application Role Connection](https://discord.com/developers/docs/resources/user#get-user-application-role-connection)
 *
 * **GET** `/users/@me/applications/:application/role-connection`
 *
 * Returns the {@link ApplicationRoleConnection | application role connection} for the user. Requires an OAuth2 access token with role_connections.write scope for the application specified in the path.
 */
export const getUserApplicationRoleConnection: Fetcher<
  typeof getUserApplicationRoleConnectionSchema,
  ApplicationRoleConnection
> = async ({ application }) =>
  get(`/users/@me/applications/${application}/role-connection`);

export const getUserApplicationRoleConnectionSafe = toValidated(
  getUserApplicationRoleConnection,
  getUserApplicationRoleConnectionSchema,
  applicationRoleConnectionSchema
);

export const getUserApplicationRoleConnectionProcedure = toProcedure(
  `query`,
  getUserApplicationRoleConnection,
  getUserApplicationRoleConnectionSchema,
  applicationRoleConnectionSchema
);

export const getUserApplicationRoleConnectionQuery = toQuery(
  getUserApplicationRoleConnection
);
