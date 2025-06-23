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

export const userBannerSchema = object({
  user: snowflake,
  banner: pipe(string(), nonEmpty()),
  format: exactOptional(picklist([`png`, `jpg`, `webp`, `gif`])),
  params: exactOptional(
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
}: InferOutput<typeof userBannerSchema>): string =>
  getAsset(`/banners/${user}/${banner}.${format ?? `png`}`, params);
