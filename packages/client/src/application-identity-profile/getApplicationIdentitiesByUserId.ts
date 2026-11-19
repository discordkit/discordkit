import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { ApplicationIdentities } from "./types/ApplicationIdentities.js";

export const getApplicationIdentitiesByUserIdSchema = v.object({
  /** the Discord user ID */
  user: snowflake,
  /** the ID of your application */
  application: snowflake
});

/**
 * ### [Get Application Identities by User ID](https://discord.com/developers/docs/resources/application-identity-profile#get-application-identities-by-user-id)
 *
 * **GET** `/users/:user/application-identities/:application`
 *
 * Returns the {@link ApplicationIdentities | application identities} for the specified user and application. Use this endpoint to discover the exact external ID values (`providerType`, `providerIssuedUserId`, and optional `providerId`) for a user's application identities.
 *
 * This endpoint does not return profile data. To read game stats for a specific identity, use {@link getApplicationIdentityProfile | Get Application Identity Profile}.
 *
 * To delete an identity, use the returned values with {@link deleteApplicationIdentity | Delete Application Identity}.
 *
 * Requires a bot token for authorization. The caller must authenticate as the bot for `application` and can only fetch identities for its own application. The target user must have authorized the application via OAuth2 with the `application_identities.write` scope. If you are building a Social SDK integration, this scope is included in the Social SDK scopes.
 */
export const getApplicationIdentitiesByUserId: Fetcher<
  typeof getApplicationIdentitiesByUserIdSchema,
  ApplicationIdentities
> = async ({ user, application }) =>
  get(`/users/${user}/application-identities/${application}`);
