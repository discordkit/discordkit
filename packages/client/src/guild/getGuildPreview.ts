import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { guildPreviewSchema, type GuildPreview } from "./types/GuildPreview.ts";

export const getGuildPreviewSchema = z.object({
  guild: snowflake
});

/**
 * ### [Get Guild Preview](https://discord.com/developers/docs/resources/guild#get-guild-preview)
 *
 * **GET* `/guilds/:guild/preview`
 *
 * Returns the {@link GuildPreview | guild preview object} for the given id. If the user is not in the guild, then the guild must be discoverable.
 */
export const getGuildPreview: Fetcher<
  typeof getGuildPreviewSchema,
  GuildPreview
> = async ({ guild }) => get(`/guilds/${guild}/preview`);

export const getGuildPreviewSafe = toValidated(
  getGuildPreview,
  getGuildPreviewSchema,
  guildPreviewSchema
);

export const getGuildPreviewProcedure = toProcedure(
  `query`,
  getGuildPreview,
  getGuildPreviewSchema,
  guildPreviewSchema
);

export const getGuildPreviewQuery = toQuery(getGuildPreview);
