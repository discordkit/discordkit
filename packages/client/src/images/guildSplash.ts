import * as v from "valibot";
import { getAsset, snowflake } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const guildSplashSchema = v.object({
  guild: snowflake,
  splash: v.pipe(v.string(), v.nonEmpty()),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const guildSplash = ({
  guild,
  splash,
  format,
  params
}: v.InferOutput<typeof guildSplashSchema>): string =>
  getAsset(`/splashes/${guild}/${splash}.${format ?? `png`}`, params);
