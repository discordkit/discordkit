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

export const guildBannerSchema = object({
  guild: snowflake,
  banner: pipe(string(), nonEmpty()),
  format: exactOptional(picklist([`png`, `jpg`, `webp`, `gif`])),
  params: exactOptional(
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
}: InferOutput<typeof guildBannerSchema>): string =>
  getAsset(`/banners/${guild}/${banner}.${format ?? `png`}`, params);
