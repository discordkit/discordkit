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

export const achievementIconSchema = object({
  application: snowflake,
  achievement: snowflake,
  icon: string([minLength(1)]),
  format: optional(enumType([`png`, `jpg`, `webp`]), `png`),
  params: optional(
    object({
      size: imageSizes
    })
  )
});

export const achievementIcon = ({
  application,
  achievement,
  icon,
  format,
  params
}: Output<typeof achievementIconSchema>): string =>
  getAsset(
    `/app-assets/${application}
/achievements/${achievement}/icons/${icon}.${format ?? `png`}`,
    params
  );
