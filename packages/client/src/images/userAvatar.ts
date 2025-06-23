import { getAsset, snowflake } from "@discordkit/core";
import {
  type InferOutput,
  object,
  exactOptional,
  string,
  picklist,
  pipe,
  nonEmpty
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const userAvatarSchema = object({
  user: snowflake,
  avatar: pipe(string(), nonEmpty()),
  format: exactOptional(picklist([`png`, `jpg`, `webp`, `gif`])),
  params: exactOptional(
    object({
      size: imageSizes
    })
  )
});

export const userAvatar = ({
  user,
  avatar,
  format,
  params
}: InferOutput<typeof userAvatarSchema>): string =>
  getAsset(`/avatars/${user}/${avatar}.${format ?? `png`}`, params);
