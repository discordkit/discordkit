import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { guildTemplateSchema, type GuildTemplate } from "./types";

export const getGuildTemplateSchema = z.object({
  template: z.string().min(1)
});

/**
 * Returns a guild template object for the given code.
 *
 * https://discord.com/developers/docs/resources/guild-template#get-guild-template
 */
export const getGuildTemplate: Fetcher<
  typeof getGuildTemplateSchema,
  GuildTemplate
> = async ({ template }) => get(`/guilds/templates/${template}`);

export const getGuildTemplateProcedure = toProcedure(
  `query`,
  getGuildTemplate,
  getGuildTemplateSchema,
  guildTemplateSchema
);

export const getGuildTemplateQuery = toQuery(getGuildTemplate);
