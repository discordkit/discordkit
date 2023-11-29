import { getAsset, snowflake } from "@discordkit/core";
import {
  type Output,
  minLength,
  object,
  optional,
  string,
  picklist
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const guildSplashSchema = object({
  guild: snowflake,
  splash: string([minLength(1)]),
  format: optional(picklist([`png`, `jpg`, `webp`]), `png`),
  params: optional(
    object({
      size: imageSizes
    })
  )
});

export const guildSplash = ({
  guild,
  splash,
  format,
  params
}: Output<typeof guildSplashSchema>): string =>
  getAsset(`/splashes/${guild}/${splash}.${format ?? `png`}`, params);
