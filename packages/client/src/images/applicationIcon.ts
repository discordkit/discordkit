import * as v from "valibot";
import { getAsset, snowflake, boundedString } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const applicationIconSchema = v.object({
  application: snowflake,
  icon: boundedString(),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const applicationIcon = ({
  application,
  icon,
  format,
  params
}: v.InferOutput<typeof applicationIconSchema>): string =>
  getAsset(`/app-icons/${application}/${icon}.${format ?? `png`}`, params);
