import * as v from "valibot";
import { post, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const deleteApplicationIdentitySchema = v.object({
  /** the Discord user ID */
  user: snowflake,
  /** the ID of your application */
  application: snowflake,
  /** the external account provider type */
  providerType: boundedString(),
  /** the user's ID in the external system */
  providerIssuedUserId: boundedString(),
  body: v.exactOptional(
    v.partial(
      v.object({
        /** provider-specific identifier used to disambiguate matching provider type and provider-issued user ID */
        providerId: boundedString()
      })
    )
  )
});

/**
 * ### [Delete Application Identity](https://discord.com/developers/docs/resources/application-identity-profile#delete-application-identity)
 *
 * **POST** `/users/:user/application-identities/:application/:providerType/:providerIssuedUserId/delete`
 *
 * Deletes one Application Identity and its associated profile data for the specified user and application. Use this endpoint when a stale provider-issued user ID prevents you from writing profile data for the user's current identity. Returns `204 No Content` on success.
 *
 * Uses the same bot/application authorization and OAuth2 authorization checks as {@link getApplicationIdentitiesByUserId | Get Application Identities by User ID}.
 *
 * Deletion is blocked if it would remove the user's last account-linking identity for the application. Profile-only `NONE` identities can be deleted. Deleting an identity also deletes the profile data stored on that identity.
 */
export const deleteApplicationIdentity: Fetcher<
  typeof deleteApplicationIdentitySchema
> = async ({ user, application, providerType, providerIssuedUserId, body }) =>
  post(
    `/users/${user}/application-identities/${application}/${encodeURIComponent(providerType)}/${encodeURIComponent(providerIssuedUserId)}/delete`,
    body
  );
