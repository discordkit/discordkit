import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  guildTemplateSchema,
  type GuildTemplate
} from "./types/GuildTemplate.ts";

export const getGuildTemplatesSchema = z.object({
  guild: snowflake
});

/**
 * ### [Get Guild Templates](https://discord.com/developers/docs/resources/guild-template#get-guild-templates)
 *
 * **GET** `/guilds/:guild/templates`
 *
 * Returns an array of {@link GuildTemplate | guild template objects}. Requires the `MANAGE_GUILD` permission.
 */
export const getGuildTemplates: Fetcher<
  typeof getGuildTemplatesSchema,
  GuildTemplate[]
> = async ({ guild }) => get(`/guilds/${guild}/templates`);

export const getGuildTemplatesSafe = toValidated(
  getGuildTemplates,
  getGuildTemplatesSchema,
  guildTemplateSchema.array()
);

export const getGuildTemplatesProcedure = toProcedure(
  `query`,
  getGuildTemplates,
  getGuildTemplatesSchema,
  guildTemplateSchema.array()
);

export const getGuildTemplatesQuery = toQuery(getGuildTemplates);
