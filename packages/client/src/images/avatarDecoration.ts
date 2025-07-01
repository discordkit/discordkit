import * as v from "valibot";
import { getAsset, snowflake } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const avatarDecorationSchema = v.object({
  asset: snowflake,
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const avatarDecoration = ({
  asset,
  params
}: v.InferOutput<typeof avatarDecorationSchema>): string =>
  getAsset(`/avatar-decoration-presets/${asset}.png`, params);
