import * as v from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  guildTemplateSchema,
  type GuildTemplate
} from "./types/GuildTemplate.js";

export const deleteGuildTemplateSchema = v.object({
  guild: snowflake,
  template: snowflake
});

/**
 * ### [Delete Guild Template](https://discord.com/developers/docs/resources/guild-template#delete-guild-template)
 *
 * **DELETE** `/guilds/:guild/templates/:template`
 *
 * Deletes the template. Requires the `MANAGE_GUILD` permission. Returns the deleted {@link GuildTemplate | guild template object} on success.
 */
export const deleteGuildTemplate: Fetcher<
  typeof deleteGuildTemplateSchema,
  GuildTemplate
> = async ({ guild, template }) =>
  remove(`/guilds/${guild}/templates/${template}`);

export const deleteGuildTemplateSafe = toValidated(
  deleteGuildTemplate,
  deleteGuildTemplateSchema,
  guildTemplateSchema
);

export const deleteGuildTemplateProcedure = toProcedure(
  `mutation`,
  deleteGuildTemplate,
  deleteGuildTemplateSchema,
  guildTemplateSchema
);
