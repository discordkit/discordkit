import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "@discordkit/core";
import {
  guildTemplateSchema,
  type GuildTemplate
} from "./types/GuildTemplate.ts";

export const getGuildTemplateSchema = z.object({
  template: z.string().min(1)
});

/**
 * ### [Get Guild Template](https://discord.com/developers/docs/resources/guild-template#get-guild-template)
 *
 * **GET** `/guilds/templates/:template`
 *
 * Returns a {@link GuildTemplate | guild template object} for the given code.
 */
export const getGuildTemplate: Fetcher<
  typeof getGuildTemplateSchema,
  GuildTemplate
> = async ({ template }) => get(`/guilds/templates/${template}`);

export const getGuildTemplateSafe = toValidated(
  getGuildTemplate,
  getGuildTemplateSchema,
  guildTemplateSchema
);

export const getGuildTemplateProcedure = toProcedure(
  `query`,
  getGuildTemplate,
  getGuildTemplateSchema,
  guildTemplateSchema
);

export const getGuildTemplateQuery = toQuery(getGuildTemplate);
