import * as v from "valibot";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";

const _applicationIdentitySchema = v.object({
  /** the Discord user ID the identity belongs to. Present on the identities the lookup endpoints return; the structure table in Discord's docs omits it, but their response examples include it. */
  userId: v.exactOptional(snowflake),
  /** the external account provider type */
  providerType: boundedString(),
  /** provider-specific identifier used to disambiguate identities; omitted when absent or empty */
  providerId: v.exactOptional(boundedString()),
  /** the user's ID in the external system */
  providerIssuedUserId: boundedString()
});

export interface ApplicationIdentity extends v.InferOutput<
  typeof _applicationIdentitySchema
> {}

/**
 * ### [Application Identity](https://discord.com/developers/docs/resources/application-identity-profile#application-identity-object)
 *
 * A user's identity in your application, identified by an external account key: a provider type, an optional provider ID, and a provider-issued user ID.
 */
export const applicationIdentitySchema = schema<ApplicationIdentity>(
  _applicationIdentitySchema
);
