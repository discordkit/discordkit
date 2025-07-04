import * as v from "valibot";
import { getAsset, snowflake, boundedString } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const guildMemberAvatarSchema = v.object({
  guild: snowflake,
  user: snowflake,
  avatar: boundedString(),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`, `gif`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const guildMemberAvatar = ({
  guild,
  user,
  avatar,
  format,
  params
}: v.InferOutput<typeof guildMemberAvatarSchema>): string =>
  getAsset(
    `/guilds/${guild}/users/${user}/avatars/${avatar}.${format ?? `png`}`,
    params
  );
