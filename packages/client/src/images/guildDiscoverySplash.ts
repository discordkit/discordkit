import * as v from "valibot";
import { getAsset, snowflake, boundedString } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const guildDiscoverySplashSchema = v.object({
  guild: snowflake,
  splash: boundedString(),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const guildDiscoverySplash = ({
  guild,
  splash,
  format,
  params
}: v.InferOutput<typeof guildDiscoverySplashSchema>): string =>
  getAsset(`/discovery-splashes/${guild}/${splash}.${format ?? `png`}`, params);
