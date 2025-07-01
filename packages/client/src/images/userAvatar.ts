import * as v from "valibot";
import { getAsset, snowflake } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const userAvatarSchema = v.object({
  user: snowflake,
  avatar: v.pipe(v.string(), v.nonEmpty()),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`, `gif`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const userAvatar = ({
  user,
  avatar,
  format,
  params
}: v.InferOutput<typeof userAvatarSchema>): string =>
  getAsset(`/avatars/${user}/${avatar}.${format ?? `png`}`, params);
