import * as v from "valibot";
import { snowflake } from "@discordkit/core";

export const avatarDecorationDataSchema = v.object({
  /** the avatar decoration hash */
  asset: v.pipe(v.string(), v.nonEmpty()),
  /** id of the avatar decoration's SKU */
  skuId: snowflake
});

export interface AvatarDecorationData
  extends v.InferOutput<typeof avatarDecorationDataSchema> {}
