import { z } from "zod";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  guildTemplateSchema,
  type GuildTemplate
} from "./types/GuildTemplate.ts";

export const createGuildTemplateSchema = z.object({
  guild: snowflake,
  body: z.object({
    /** name of the template (1-100 characters) */
    name: z.string().min(1).max(100),
    /** description for the template (0-120 characters) */
    description: z.string().min(0).max(120).optional()
  })
});

/**
 * ### [Create Guild Template](https://discord.com/developers/docs/resources/guild-template#create-guild-template)
 *
 * **POST** `/guilds/:guild/templates`
 *
 * Creates a template for the guild. Requires the `MANAGE_GUILD` permission. Returns the created {@link GuildTemplate | guild template object} on success.
 */
export const createGuildTemplate: Fetcher<
  typeof createGuildTemplateSchema,
  GuildTemplate
> = async ({ guild, body }) => post(`/guilds/${guild}/templates`, body);

export const createGuildTemplateSafe = toValidated(
  createGuildTemplate,
  createGuildTemplateSchema,
  guildTemplateSchema
);

export const createGuildTemplateProcedure = toProcedure(
  `mutation`,
  createGuildTemplate,
  createGuildTemplateSchema,
  guildTemplateSchema
);
