import * as v from "valibot";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema } from "@discordkit/core/validations/schema";
import { profileDataSchema } from "./ProfileData.js";

const _applicationIdentityProfileSchema = v.object({
  /** the user's username in the external system */
  username: v.nullable(boundedString({ max: 1024 })),
  /** arbitrary game-defined data; not consumed by Discord, stored for the application's own use */
  metadata: v.nullable(v.record(v.string(), v.unknown())),
  /** the {@link ProfileData | profile data} containing game stats */
  data: v.nullable(profileDataSchema)
});

export interface ApplicationIdentityProfile extends v.InferOutput<
  typeof _applicationIdentityProfileSchema
> {}

/**
 * ### [Application Identity Profile](https://discord.com/developers/docs/resources/application-identity-profile#application-identity-profile-object)
 *
 * Application Identity Profiles store game data associated with a user's identity in your application. This data powers Game Stats Widgets on Discord user profiles.
 */
export const applicationIdentityProfileSchema =
  schema<ApplicationIdentityProfile>(_applicationIdentityProfileSchema);
