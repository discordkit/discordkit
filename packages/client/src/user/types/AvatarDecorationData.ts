import { snowflake } from "@discordkit/core";
import type { InferOutput } from "valibot";
import { nonEmpty, object, pipe, string } from "valibot";

export const avatarDecorationDataSchema = object({
  /** the avatar decoration hash */
  asset: pipe(string(), nonEmpty()),
  /** id of the avatar decoration's SKU */
  skuId: snowflake
});

export interface AvatarDecorationData
  extends InferOutput<typeof avatarDecorationDataSchema> {}
