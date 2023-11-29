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

export const guildMemberBannerSchema = object({
  guild: snowflake,
  user: snowflake,
  banner: string([minLength(1)]),
  format: optional(picklist([`png`, `jpg`, `webp`, `gif`]), `png`),
  params: optional(
    object({
      size: imageSizes
    })
  )
});

export const guildMemberBanner = ({
  guild,
  user,
  banner,
  format,
  params
}: Output<typeof guildMemberBannerSchema>): string =>
  getAsset(
    `/guilds/${guild}/users/${user}/banners/${banner}.${format ?? `png`}`,
    params
  );
