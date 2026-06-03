import * as v from "valibot";
import { remove, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const deleteCurrentUserApplicationRoleConnectionSchema = v.object({
  application: snowflake
});

/**
 * ### [Delete Current User Application Role Connection](https://discord.com/developers/docs/resources/user#delete-current-user-application-role-connection)
 *
 * **DELETE** `/users/@me/applications/:application/role-connection`
 *
 * Deletes the {@link ApplicationRoleConnection | application role connection} for the user. Requires an OAuth2 access token with `role_connections.write` scope for the application specified in the path.
 */
export const deleteCurrentUserApplicationRoleConnection: Fetcher<
  typeof deleteCurrentUserApplicationRoleConnectionSchema
> = async ({ application }) =>
  remove(`/users/@me/applications/${application}/role-connection`);
