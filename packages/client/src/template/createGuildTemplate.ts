import { maxLength, minLength, object, optional, string } from "valibot";
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

export const createGuildTemplateSchema = object({
  guild: snowflake,
  body: object({
    /** name of the template (1-100 characters) */
    name: string([minLength(1), maxLength(100)]),
    /** description for the template (0-120 characters) */
    description: optional(string([minLength(0), maxLength(120)]))
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
