import * as v from "valibot";
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
} from "./types/GuildTemplate.js";

export const createGuildTemplateSchema = v.object({
  guild: snowflake,
  body: v.object({
    /** name of the template (1-100 characters) */
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    /** description for the template (0-120 characters) */
    description: v.nullish(v.pipe(v.string(), v.minLength(0), v.maxLength(120)))
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
