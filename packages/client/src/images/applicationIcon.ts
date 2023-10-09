import { getAsset, snowflake } from "@discordkit/core";
import {
  type Output,
  enumType,
  minLength,
  object,
  optional,
  string
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const applicationIconSchema = object({
  application: snowflake,
  icon: string([minLength(1)]),
  format: optional(enumType([`png`, `jpg`, `webp`]), `png`),
  params: optional(
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
}: Output<typeof applicationIconSchema>): string =>
  getAsset(`/app-icons/${application}/${icon}.${format ?? `png`}`, params);
