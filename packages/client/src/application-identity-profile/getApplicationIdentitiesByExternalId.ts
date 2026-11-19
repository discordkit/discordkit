import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { ApplicationIdentities } from "./types/ApplicationIdentities.js";

export const getApplicationIdentitiesByExternalIdSchema = v.object({
  /** the ID of your application */
  application: snowflake,
  /** the external account provider type */
  providerType: boundedString(),
  /** the user's ID in the external system */
  providerIssuedUserId: boundedString(),
  params: v.exactOptional(
    v.partial(
      v.object({
        /** provider-specific identifier used to disambiguate matching provider type and provider-issued user ID */
        providerId: boundedString()
      })
    )
  )
});

/**
 * ### [Get Application Identities by External ID](https://discord.com/developers/docs/resources/application-identity-profile#get-application-identities-by-external-id)
 *
 * **GET** `/applications/:application/application-identities/:providerType/:providerIssuedUserId`
 *
 * Returns the {@link ApplicationIdentities | application identities} for the user/application record currently associated with the specified external ID (combination of `providerType`, `providerIssuedUserId`, and optional `providerId`). Use this endpoint when you need to resolve the Discord `userId` for an Application Identity but only know the external ID fields. If no identity matches the external account key, `identities` is empty.
 *
 * This endpoint does not return profile data. To read game stats for a specific identity, use {@link getApplicationIdentityProfile | Get Application Identity Profile}.
 *
 * To delete an identity, use the returned values with {@link deleteApplicationIdentity | Delete Application Identity}.
 *
 * Requires a bot token for authorization. The caller must authenticate as the bot for `application` and can only fetch identities for its own application. The matched user must have authorized the application via OAuth2 with the `application_identities.write` scope. If you are building a Social SDK integration, this scope is included in the Social SDK scopes.
 */
export const getApplicationIdentitiesByExternalId: Fetcher<
  typeof getApplicationIdentitiesByExternalIdSchema,
  ApplicationIdentities
> = async ({ application, providerType, providerIssuedUserId, params }) =>
  get(
    `/applications/${application}/application-identities/${encodeURIComponent(providerType)}/${encodeURIComponent(providerIssuedUserId)}`,
    params
  );
