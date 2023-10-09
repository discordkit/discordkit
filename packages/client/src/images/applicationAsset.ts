import { getAsset, snowflake } from "@discordkit/core";
import { type Output, enumType, object, optional } from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const applicationAssetSchema = object({
  application: snowflake,
  asset: snowflake,
  format: optional(enumType([`png`, `jpg`, `webp`]), `png`),
  params: optional(
    object({
      size: imageSizes
    })
  )
});

export const applicationAsset = ({
  application,
  asset,
  format,
  params
}: Output<typeof applicationAssetSchema>): string =>
  getAsset(`/app-assets/${application}/${asset}.${format ?? `png`}`, params);
