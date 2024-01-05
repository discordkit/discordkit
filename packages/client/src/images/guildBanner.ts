import { getAsset, snowflake } from "@discordkit/core";
import {
  type Output,
  object,
  optional,
  string,
  minLength,
  picklist
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const guildBannerSchema = object({
  guild: snowflake,
  banner: string([minLength(1)]),
  format: optional(picklist([`png`, `jpg`, `webp`, `gif`]), `png`),
  params: optional(
    object({
      size: imageSizes
    })
  )
});

export const guildBanner = ({
  guild,
  banner,
  format,
  params
}: Output<typeof guildBannerSchema>): string =>
  getAsset(`/banners/${guild}/${banner}.${format ?? `png`}`, params);
