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

export const guildMemberBannerSchema = object({
  guild: snowflake,
  user: snowflake,
  banner: pipe(string(), nonEmpty()),
  format: exactOptional(picklist([`png`, `jpg`, `webp`, `gif`])),
  params: exactOptional(
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
}: InferOutput<typeof guildMemberBannerSchema>): string =>
  getAsset(
    `/guilds/${guild}/users/${user}/banners/${banner}.${format ?? `png`}`,
    params
  );
