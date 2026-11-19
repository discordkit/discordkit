import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { applicationIdentitySchema } from "./ApplicationIdentity.js";

const _applicationIdentitiesSchema = v.object({
  /** the matching {@link ApplicationIdentity | application identities}; empty if nothing matches */
  identities: v.array(applicationIdentitySchema)
});

export interface ApplicationIdentities extends v.InferOutput<
  typeof _applicationIdentitiesSchema
> {}

/**
 * ### [Application Identities](https://discord.com/developers/docs/resources/application-identity-profile#get-application-identities-by-user-id-response)
 *
 * The wrapped list of {@link ApplicationIdentity | application identities} the lookup endpoints return.
 */
export const applicationIdentitiesSchema = schema<ApplicationIdentities>(
  _applicationIdentitiesSchema
);
