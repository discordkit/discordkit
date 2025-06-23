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

export const guildSplashSchema = object({
  guild: snowflake,
  splash: pipe(string(), nonEmpty()),
  format: exactOptional(picklist([`png`, `jpg`, `webp`])),
  params: exactOptional(
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
}: InferOutput<typeof guildSplashSchema>): string =>
  getAsset(`/splashes/${guild}/${splash}.${format ?? `png`}`, params);
