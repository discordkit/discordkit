import * as v from "valibot";
import { getAsset } from "@discordkit/core/requests/getAsset";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { imageSizes } from "./types/ImageSizes.js";

export const roleIconSchema = v.object({
  role: snowflake,
  icon: boundedString(),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const roleIcon = ({
  role,
  icon,
  format,
  params
}: v.InferOutput<typeof roleIconSchema>): string =>
  getAsset(`/role-icons/${role}/${icon}.${format ?? `png`}`, params);
