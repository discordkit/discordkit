import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { url } from "@discordkit/core/validations/url";

const _profileMediaSchema = v.object({
  /** URL of the media asset */
  url
});

export interface ProfileMedia extends v.InferOutput<
  typeof _profileMediaSchema
> {}

/**
 * ### [Media](https://discord.com/developers/docs/resources/application-identity-profile#media-object)
 *
 * > [!NOTE]
 * >
 * > Media URLs must be reachable from the public internet. Discord's media unfurler fetches the URL from its servers, not from the user's client, so `localhost` or LAN-only URLs won't load.
 */
export const profileMediaSchema = schema<ProfileMedia>(_profileMediaSchema);
