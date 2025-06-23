import { object } from "valibot";
import {
  put,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  guildTemplateSchema,
  type GuildTemplate
} from "./types/GuildTemplate.js";

export const syncGuildTemplateSchema = object({
  guild: snowflake,
  template: snowflake
});

/**
 * ### [Sync Guild Template](https://discord.com/developers/docs/resources/guild-template#sync-guild-template)
 *
 * **PUT** `/guilds/:guild/templates/:template`
 *
 * Syncs the template to the guild's current state. Requires the `MANAGE_GUILD` permission. Returns the {@link GuildTemplate | guild template object} on success.
 */
export const syncGuildTemplate: Fetcher<
  typeof syncGuildTemplateSchema,
  GuildTemplate
> = async ({ guild, template }) =>
  put(`/guilds/${guild}/templates/${template}`);

export const syncGuildTemplateSafe = toValidated(
  syncGuildTemplate,
  syncGuildTemplateSchema,
  guildTemplateSchema
);

export const syncGuildTemplateProcedure = toProcedure(
  `mutation`,
  syncGuildTemplate,
  syncGuildTemplateSchema,
  guildTemplateSchema
);
