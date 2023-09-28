import { z } from "zod";
import { put, type Fetcher, toProcedure } from "#/utils/index.ts";
import {
  type ApplicationRoleConnection,
  applicationRoleConnectionSchema
} from "#/application/types/ApplicationRoleConnection.ts";

export const updateUserApplicationRoleConnectionSchema = z.object({
  application: z.string().min(1),
  body: z
    .object({
      /** the vanity name of the platform a bot has connected (max 50 characters) */
      platformName: z.string().nullable(),
      /** the username on the platform a bot has connected (max 100 characters) */
      platformUsername: z.string().nullable(),
      /** object mapping application role connection metadata keys to their string-ified value (max 100 characters) for the user on the platform a bot has connected */
      metadata: z.record(
        z
          .string()
          .min(1)
          .max(50)
          .regex(/[a-z0-9_]/),
        z.string().max(100).nullable()
      )
    })
    .partial()
});

/**
 * ### [Update User Application Role Connection](https://discord.com/developers/docs/resources/user#update-user-application-role-connection)
 *
 * **PUT** `/users/@me/applications/:application/role-connection`
 *
 * Updates and returns the {@link ApplicationRoleConnection | application role connection} for the user. Requires an OAuth2 access token with `role_connections.write` scope for the application specified in the path.
 */
export const updateUserApplicationRoleConnection: Fetcher<
  typeof updateUserApplicationRoleConnectionSchema,
  ApplicationRoleConnection
> = async ({ application, body }) =>
  put(`/users/@me/applications/${application}/role-connection`, body);

export const updateUserApplicationRoleConnectionProcedure = toProcedure(
  `mutation`,
  updateUserApplicationRoleConnection,
  updateUserApplicationRoleConnectionSchema,
  applicationRoleConnectionSchema
);
