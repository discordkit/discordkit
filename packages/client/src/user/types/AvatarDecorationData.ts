import * as v from "valibot";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";

/**
 * ### [Avatar Decoration Data](https://discord.com/developers/docs/resources/user#avatar-decoration-data-object)
 *
 * The data for the user's [avatar decoration](https://support.discord.com/hc/en-us/articles/13410113109911-Avatar-Decorations).
 */
export const avatarDecorationDataSchema = v.object({
  /** the avatar decoration hash */
  asset: boundedString(),
  /** id of the avatar decoration's SKU */
  skuId: snowflake
});

export interface AvatarDecorationData extends v.InferOutput<
  typeof avatarDecorationDataSchema
> {}
