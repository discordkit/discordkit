import * as v from "valibot";
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
} from "./types/ApplicationRoleConnection.js";

export const updateCurrentUserApplicationRoleConnectionSchema = v.object({
  application: snowflake,
  body: v.partial(
    v.object({
      /** the vanity name of the platform a bot has connected (max 50 characters) */
      platformName: v.nullish(v.string()),
      /** the username on the platform a bot has connected (max 100 characters) */
      platformUsername: v.nullish(v.string()),
      /** object mapping application role connection metadata keys to their string-ified value (max 100 characters) for the user on the platform a bot has connected */
      metadata: v.record(
        v.pipe(
          v.string(),
          v.minLength(1),
          v.maxLength(50),
          v.regex(/[a-z0-9_]/)
        ),
        v.nullish(v.pipe(v.string(), v.maxLength(100)))
      )
    })
  )
});

/**
 * ### [Update Current User Application Role Connection](https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection)
 *
 * **PUT** `/users/@me/applications/:application/role-connection`
 *
 * Updates and returns the {@link ApplicationRoleConnection | application role connection} for the user. Requires an OAuth2 access token with `role_connections.write` scope for the application specified in the path.
 */
export const updateCurrentUserApplicationRoleConnection: Fetcher<
  typeof updateCurrentUserApplicationRoleConnectionSchema,
  ApplicationRoleConnection
> = async ({ application, body }) =>
  put(`/users/@me/applications/${application}/role-connection`, body);

export const updateCurrentUserApplicationRoleConnectionSafe = toValidated(
  updateCurrentUserApplicationRoleConnection,
  updateCurrentUserApplicationRoleConnectionSchema,
  applicationRoleConnectionSchema
);

export const updateCurrentUserApplicationRoleConnectionProcedure = toProcedure(
  `mutation`,
  updateCurrentUserApplicationRoleConnection,
  updateCurrentUserApplicationRoleConnectionSchema,
  applicationRoleConnectionSchema
);
