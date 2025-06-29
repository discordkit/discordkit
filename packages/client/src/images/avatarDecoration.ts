import { getAsset, snowflake } from "@discordkit/core";
import { type InferOutput, object, exactOptional } from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const avatarDecorationSchema = object({
  asset: snowflake,
  params: exactOptional(
    object({
      size: imageSizes
    })
  )
});

export const avatarDecoration = ({
  asset,
  params
}: InferOutput<typeof avatarDecorationSchema>): string =>
  getAsset(`/avatar-decoration-presets/${asset}.png`, params);
