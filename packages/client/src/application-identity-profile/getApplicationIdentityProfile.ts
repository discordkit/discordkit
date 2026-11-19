import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { ApplicationIdentityProfile } from "./types/ApplicationIdentityProfile.js";

export const getApplicationIdentityProfileSchema = v.object({
  /** the ID of your application */
  application: snowflake,
  /** the Discord user ID */
  user: snowflake,
  /** the user's ID in your system */
  providerIssuedUserId: boundedString()
});

/**
 * ### [Get Application Identity Profile](https://discord.com/developers/docs/resources/application-identity-profile#get-application-identity-profile)
 *
 * **GET** `/applications/:application/users/:user/identities/:providerIssuedUserId/profile`
 *
 * Returns the {@link ApplicationIdentityProfile | Application Identity Profile} object stored on the matching Application Identity for the specified user and application.
 *
 * Requires a bot token for authorization. The target user must have authorized the application via OAuth2 with the `application_identities.write` scope. If you are building a Social SDK integration, this scope is included in the Social SDK scopes.
 */
export const getApplicationIdentityProfile: Fetcher<
  typeof getApplicationIdentityProfileSchema,
  ApplicationIdentityProfile
> = async ({ application, user, providerIssuedUserId }) =>
  get(
    `/applications/${application}/users/${user}/identities/${encodeURIComponent(providerIssuedUserId)}/profile`
  );
