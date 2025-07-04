import * as v from "valibot";
import { getAsset, snowflake, boundedString } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const achievementIconSchema = v.object({
  application: snowflake,
  achievement: snowflake,
  icon: boundedString(),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`])),
  params: v.exactOptional(
    v.object({
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
}: v.InferOutput<typeof achievementIconSchema>): string =>
  getAsset(
    `/app-assets/${application}
/achievements/${achievement}/icons/${icon}.${format ?? `png`}`,
    params
  );
