import * as v from "valibot";
import { put, type Fetcher, snowflake } from "@discordkit/core";
import { type GuildTemplate } from "./types/GuildTemplate.js";

export const syncGuildTemplateSchema = v.object({
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
