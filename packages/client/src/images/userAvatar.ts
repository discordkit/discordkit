import { getAsset, snowflake } from "@discordkit/core";
import {
  type Output,
  minLength,
  object,
  optional,
  string,
  enumType
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const userAvatarSchema = object({
  user: snowflake,
  avatar: string([minLength(1)]),
  format: optional(enumType([`png`, `jpg`, `webp`, `gif`]), `png`),
  params: optional(
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
}: Output<typeof userAvatarSchema>): string =>
  getAsset(`/avatars/${user}/${avatar}.${format ?? `png`}`, params);
