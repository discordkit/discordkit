import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import {
  type ApplicationRoleConnection,
  applicationRoleConnectionSchema
} from "../application/types/ApplicationRoleConnection";

export const getUserApplicationRoleConnectionSchema = z.object({
  application: z.string().min(1)
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

export const getUserApplicationRoleConnectionProcedure = toProcedure(
  `query`,
  getUserApplicationRoleConnection,
  getUserApplicationRoleConnectionSchema,
  applicationRoleConnectionSchema
);

export const getUserApplicationRoleConnectionQuery = toQuery(
  getUserApplicationRoleConnection
);
