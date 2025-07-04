import * as v from "valibot";
import { snowflake, boundedString } from "@discordkit/core";

export const avatarDecorationDataSchema = v.object({
  /** the avatar decoration hash */
  asset: boundedString(),
  /** id of the avatar decoration's SKU */
  skuId: snowflake
});

export interface AvatarDecorationData
  extends v.InferOutput<typeof avatarDecorationDataSchema> {}
