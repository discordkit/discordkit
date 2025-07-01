import * as v from "valibot";
import { getAsset, snowflake } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const guildMemberBannerSchema = v.object({
  guild: snowflake,
  user: snowflake,
  banner: v.pipe(v.string(), v.nonEmpty()),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`, `gif`])),
  params: v.exactOptional(
    v.object({
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
}: v.InferOutput<typeof guildMemberBannerSchema>): string =>
  getAsset(
    `/guilds/${guild}/users/${user}/banners/${banner}.${format ?? `png`}`,
    params
  );
