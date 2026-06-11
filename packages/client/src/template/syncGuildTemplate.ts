import * as v from "valibot";
import { put, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { GuildTemplate } from "./types/GuildTemplate.js";

export const syncGuildTemplateSchema = v.object({
  guild: snowflake,
  code: snowflake
});

/**
 * ### [Sync Guild Template](https://discord.com/developers/docs/resources/guild-template#sync-guild-template)
 *
 * **PUT** `/guilds/:guild/templates/:code`
 *
 * Syncs the template to the guild's current state. Requires the `MANAGE_GUILD` permission. Returns the {@link GuildTemplate | guild template object} on success.
 */
export const syncGuildTemplate: Fetcher<
  typeof syncGuildTemplateSchema,
  GuildTemplate
> = async ({ guild, code }) => put(`/guilds/${guild}/templates/${code}`);
