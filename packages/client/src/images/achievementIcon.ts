import { getAsset, snowflake } from "@discordkit/core";
import {
  type InferOutput,
  picklist,
  object,
  exactOptional,
  string,
  pipe,
  nonEmpty
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const achievementIconSchema = object({
  application: snowflake,
  achievement: snowflake,
  icon: pipe(string(), nonEmpty()),
  format: exactOptional(picklist([`png`, `jpg`, `webp`])),
  params: exactOptional(
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
}: InferOutput<typeof achievementIconSchema>): string =>
  getAsset(
    `/app-assets/${application}
/achievements/${achievement}/icons/${icon}.${format ?? `png`}`,
    params
  );
