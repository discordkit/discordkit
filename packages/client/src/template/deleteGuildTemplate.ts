import * as v from "valibot";
import { remove, type Fetcher, snowflake } from "@discordkit/core";
import { type GuildTemplate } from "./types/GuildTemplate.js";

export const deleteGuildTemplateSchema = v.object({
  guild: snowflake,
  code: snowflake
});

/**
 * ### [Delete Guild Template](https://discord.com/developers/docs/resources/guild-template#delete-guild-template)
 *
 * **DELETE** `/guilds/:guild/templates/:code`
 *
 * Deletes the template. Requires the `MANAGE_GUILD` permission. Returns the deleted {@link GuildTemplate | guild template object} on success.
 */
export const deleteGuildTemplate: Fetcher<
  typeof deleteGuildTemplateSchema,
  GuildTemplate
> = async ({ guild, code }) => remove(`/guilds/${guild}/templates/${code}`);
