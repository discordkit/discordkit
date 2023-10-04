import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.js";

export const guildMemberBannerSchema = z.object({
  guild: snowflake,
  user: snowflake,
  banner: z.string().min(1),
  format: z
    .union([
      z.literal(`png`),
      z.literal(`jpg`),
      z.literal(`webp`),
      z.literal(`gif`)
    ])
    .default(`png`)
    .optional(),
  params: z
    .object({
      size: imageSizes
    })
    .optional()
});

export const guildMemberBanner = ({
  guild,
  user,
  banner,
  format,
  params
}: z.infer<typeof guildMemberBannerSchema>): string =>
  getAsset(
    `/guilds/${guild}/users/${user}/banners/${banner}.${format ?? `png`}`,
    params
  );
