import { getAsset, snowflake } from "@discordkit/core";
import { type Output, minLength, object, optional, string } from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const userAvatarDecorationSchema = object({
  user: snowflake,
  decoration: string([minLength(1)]),
  params: optional(
    object({
      size: imageSizes
    })
  )
});

export const userAvatarDecoration = ({
  user,
  decoration,
  params
}: Output<typeof userAvatarDecorationSchema>): string =>
  getAsset(`/avatar-decorations/${user}/${decoration}.png`, params);
