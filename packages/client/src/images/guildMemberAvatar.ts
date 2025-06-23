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

export const guildMemberAvatarSchema = object({
  guild: snowflake,
  user: snowflake,
  avatar: pipe(string(), nonEmpty()),
  format: exactOptional(picklist([`png`, `jpg`, `webp`, `gif`])),
  params: exactOptional(
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
}: InferOutput<typeof guildMemberAvatarSchema>): string =>
  getAsset(
    `/guilds/${guild}/users/${user}/avatars/${avatar}.${format ?? `png`}`,
    params
  );
