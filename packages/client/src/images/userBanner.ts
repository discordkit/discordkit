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

export const userBannerSchema = object({
  user: snowflake,
  banner: string([minLength(1)]),
  format: optional(enumType([`png`, `jpg`, `webp`, `gif`]), `png`),
  params: optional(
    object({
      size: imageSizes
    })
  )
});

export const userBanner = ({
  user,
  banner,
  format,
  params
}: Output<typeof userBannerSchema>): string =>
  getAsset(`/banners/${user}/${banner}.${format ?? `png`}`, params);
