import { getAsset, snowflake } from "@discordkit/core";
import {
  type InferOutput,
  object,
  string,
  picklist,
  exactOptional,
  pipe,
  nonEmpty
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const guildDiscoverySplashSchema = object({
  guild: snowflake,
  splash: pipe(string(), nonEmpty()),
  format: exactOptional(picklist([`png`, `jpg`, `webp`])),
  params: exactOptional(
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
}: InferOutput<typeof guildDiscoverySplashSchema>): string =>
  getAsset(`/discovery-splashes/${guild}/${splash}.${format ?? `png`}`, params);
