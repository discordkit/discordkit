import * as v from "valibot";
import { getAsset, snowflake } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const userAvatarDecorationSchema = v.object({
  user: snowflake,
  decoration: v.pipe(v.string(), v.nonEmpty()),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const userAvatarDecoration = ({
  user,
  decoration,
  params
}: v.InferOutput<typeof userAvatarDecorationSchema>): string =>
  getAsset(`/avatar-decorations/${user}/${decoration}.png`, params);
