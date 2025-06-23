import { getAsset, snowflake } from "@discordkit/core";
import {
  type InferOutput,
  picklist,
  object,
  exactOptional,
  string,
  pipe,
  nonEmpty
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const applicationIconSchema = object({
  application: snowflake,
  icon: pipe(string(), nonEmpty()),
  format: exactOptional(picklist([`png`, `jpg`, `webp`])),
  params: exactOptional(
    object({
      size: imageSizes
    })
  )
});

export const applicationIcon = ({
  application,
  icon,
  format,
  params
}: InferOutput<typeof applicationIconSchema>): string =>
  getAsset(`/app-icons/${application}/${icon}.${format ?? `png`}`, params);
