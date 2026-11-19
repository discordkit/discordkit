import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { dynamicFieldSchema } from "./DynamicField.js";
import { primaryProfileDataSchema } from "./PrimaryProfileData.js";

const _profileDataSchema = v.object({
  /** pre-configured game stat fields */
  primary: v.exactOptional(primaryProfileDataSchema),
  /** custom game stat fields (max 30) */
  dynamic: v.exactOptional(v.pipe(v.array(dynamicFieldSchema), v.maxLength(30)))
});

export interface ProfileData extends v.InferOutput<typeof _profileDataSchema> {}

/**
 * ### [Profile Data](https://discord.com/developers/docs/resources/application-identity-profile#profile-data-object)
 *
 * The game stats stored on an {@link ApplicationIdentityProfile | application identity profile}. The serialized object is limited to 10 KB.
 */
export const profileDataSchema = schema<ProfileData>(_profileDataSchema);
