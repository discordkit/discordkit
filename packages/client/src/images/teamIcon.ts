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

export const teamIconSchema = object({
  team: snowflake,
  icon: string([minLength(1)]),
  format: optional(enumType([`png`, `jpg`, `webp`]), `png`),
  params: optional(
    object({
      size: imageSizes
    })
  )
});

export const teamIcon = ({
  team,
  icon,
  format,
  params
}: Output<typeof teamIconSchema>): string =>
  getAsset(`/team-icons/${team}/${icon}.${format ?? `png`}`, params);
