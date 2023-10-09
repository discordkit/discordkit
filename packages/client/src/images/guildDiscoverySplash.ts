import { getAsset, snowflake } from "@discordkit/core";
import {
  type Output,
  object,
  string,
  minLength,
  enumType,
  optional
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const guildDiscoverySplashSchema = object({
  guild: snowflake,
  splash: string([minLength(1)]),
  format: optional(enumType([`png`, `jpg`, `webp`]), `png`),
  params: optional(
    object({
      size: imageSizes
    })
  )
});

export const guildDiscoverySplash = ({
  guild,
  splash,
  format,
  params
}: Output<typeof guildDiscoverySplashSchema>): string =>
  getAsset(`/discovery-splashes/${guild}/${splash}.${format ?? `png`}`, params);
