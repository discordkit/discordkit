import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { guildSchema, type Guild } from "./types";

export const getGuildPreviewSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns the guild preview object for the given id. If the user is not in the guild, then the guild must be lurkable.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-preview
 */
export const getGuildPreview: Fetcher<
  typeof getGuildPreviewSchema,
  Guild
> = async ({ guild }) => get(`/guilds/${guild}/preview`);

export const getGuildPreviewProcedure = toProcedure(
  `query`,
  getGuildPreview,
  getGuildPreviewSchema,
  guildSchema
);

export const getGuildPreviewQuery = toQuery(getGuildPreview);
