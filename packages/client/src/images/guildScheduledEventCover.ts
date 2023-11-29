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

export const guildScheduledEventCoverSchema = object({
  event: snowflake,
  cover: string([minLength(1)]),
  format: optional(picklist([`png`, `jpg`, `webp`]), `png`),
  params: optional(
    object({
      size: imageSizes
    })
  )
});

export const guildScheduledEventCover = ({
  event,
  cover,
  format,
  params
}: Output<typeof guildScheduledEventCoverSchema>): string =>
  getAsset(`/guild-events/${event}/${cover}.${format ?? `png`}`, params);
