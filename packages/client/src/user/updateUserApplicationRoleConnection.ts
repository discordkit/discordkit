import { z } from "zod";
import {
  put,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  type ApplicationRoleConnection,
  applicationRoleConnectionSchema
} from "../application/types/ApplicationRoleConnection.js";

export const updateUserApplicationRoleConnectionSchema = z.object({
  application: snowflake,
  body: z
    .object({
      /** the vanity name of the platform a bot has connected (max 50 characters) */
      platformName: z.string().nullish(),
      /** the username on the platform a bot has connected (max 100 characters) */
      platformUsername: z.string().nullish(),
      /** object mapping application role connection metadata keys to their string-ified value (max 100 characters) for the user on the platform a bot has connected */
      metadata: z.record(
        z
          .string()
          .min(1)
          .max(50)
          .regex(/[a-z0-9_]/),
        z.string().max(100).nullish()
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

export const updateUserApplicationRoleConnectionSafe = toValidated(
  updateUserApplicationRoleConnection,
  updateUserApplicationRoleConnectionSchema,
  applicationRoleConnectionSchema
);

export const updateUserApplicationRoleConnectionProcedure = toProcedure(
  `mutation`,
  updateUserApplicationRoleConnection,
  updateUserApplicationRoleConnectionSchema,
  applicationRoleConnectionSchema
);
