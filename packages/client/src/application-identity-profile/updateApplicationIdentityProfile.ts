import * as v from "valibot";
import { patch, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { profileDataSchema } from "./types/ProfileData.js";

export const updateApplicationIdentityProfileSchema = v.object({
  /** the ID of your application */
  application: snowflake,
  /** the Discord user ID */
  user: snowflake,
  /** the user's ID in your system */
  providerIssuedUserId: boundedString(),
  body: v.partial(
    v.object({
      /** the user's username in your system (max 1024 characters) */
      username: boundedString({ max: 1024 }),
      /** the {@link ProfileData | profile data} to update */
      data: profileDataSchema
    })
  )
});

/**
 * ### [Update Application Identity Profile](https://discord.com/developers/docs/resources/application-identity-profile#update-application-identity-profile)
 *
 * **PATCH** `/applications/:application/users/:user/identities/:providerIssuedUserId/profile`
 *
 * Updates the profile data on the user's matching Application Identity record. Returns `201 Created` on first write, `204 No Content` on subsequent updates.
 *
 * If the user does not have an Application Identity for your application yet, the first successful update creates a profile-only Application Identity with provider type `NONE` and the `providerIssuedUserId` from the path. If the user already has an Application Identity for your application, the `providerIssuedUserId` in the path must match an existing Application Identity.
 *
 * Requires a bot token for authorization. The target user must have authorized the application via OAuth2 with the `application_identities.write` scope. If you are building a Social SDK integration, this scope is included in the Social SDK scopes.
 *
 * > [!WARNING]
 * >
 * > The `data` field is **fully replaced** on every PATCH. If you include `data` in your request body, the entire previous data payload is overwritten and any fields you omit are lost. Always send the complete set of data you want stored. If you omit `data` from the request body entirely, existing data is left untouched.
 *
 * @remarks
 * Discord's docs also say this endpoint returns an {@link ApplicationIdentityProfile | Application Identity Profile} object, which a `204 No Content` cannot carry. It is typed as returning nothing; read the stored profile back with {@link getApplicationIdentityProfile}.
 */
export const updateApplicationIdentityProfile: Fetcher<
  typeof updateApplicationIdentityProfileSchema
> = async ({ application, user, providerIssuedUserId, body }) =>
  patch(
    `/applications/${application}/users/${user}/identities/${encodeURIComponent(providerIssuedUserId)}/profile`,
    body
  );
