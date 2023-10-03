import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.ts";

export const guildMemberAvatarSchema = z.object({
  guild: snowflake,
  user: snowflake,
  avatar: z.string().min(1),
  format: z
    .union([
      z.literal(`png`),
      z.literal(`jpg`),
      z.literal(`webp`),
      z.literal(`gif`)
    ])
    .optional()
    .default(`png`),
  params: z
    .object({
      size: imageSizes
    })
    .optional()
});

export const guildMemberAvatar = ({
  guild,
  user,
  avatar,
  format,
  params
}: z.infer<typeof guildMemberAvatarSchema>): string =>
  getAsset(
    `/guilds/${guild}/users/${user}/avatars/${avatar}.${format}`,
    params
  );
