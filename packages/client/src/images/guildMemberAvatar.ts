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

export const guildMemberAvatarSchema = object({
  guild: snowflake,
  user: snowflake,
  avatar: string([minLength(1)]),
  format: optional(picklist([`png`, `jpg`, `webp`, `gif`]), `png`),
  params: optional(
    object({
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
}: Output<typeof guildMemberAvatarSchema>): string =>
  getAsset(
    `/guilds/${guild}/users/${user}/avatars/${avatar}.${format ?? `png`}`,
    params
  );
