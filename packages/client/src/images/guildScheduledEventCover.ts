import * as v from "valibot";
import { getAsset } from "@discordkit/core/requests/getAsset";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { imageSizes } from "./types/ImageSizes.js";

export const guildScheduledEventCoverSchema = v.object({
  event: snowflake,
  cover: boundedString(),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const guildScheduledEventCover = ({
  event,
  cover,
  format,
  params
}: v.InferOutput<typeof guildScheduledEventCoverSchema>): string =>
  getAsset(`/guild-events/${event}/${cover}.${format ?? `png`}`, params);
