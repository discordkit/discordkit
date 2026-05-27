import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type GuildTemplate } from "./types/GuildTemplate.js";

export const getGuildTemplatesSchema = v.object({
  guild: snowflake
});

/**
 * ### [Get Guild Templates](https://discord.com/developers/docs/resources/guild-template#get-guild-templates)
 *
 * **GET** `/guilds/:guild/templates`
 *
 * Returns an array of {@link GuildTemplate | guild template objects}. Requires the `MANAGE_GUILD` permission.
 */
export const getGuildTemplates: Fetcher<
  typeof getGuildTemplatesSchema,
  GuildTemplate[]
> = async ({ guild }) => get(`/guilds/${guild}/templates`);
