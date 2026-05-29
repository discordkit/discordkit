import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type GuildTemplate } from "./types/GuildTemplate.js";

export const getGuildTemplateSchema = v.object({
  code: snowflake
});

/**
 * ### [Get Guild Template](https://discord.com/developers/docs/resources/guild-template#get-guild-template)
 *
 * **GET** `/guilds/templates/:code`
 *
 * Returns a {@link GuildTemplate | guild template object} for the given code.
 */
export const getGuildTemplate: Fetcher<
  typeof getGuildTemplateSchema,
  GuildTemplate
> = async ({ code }) => get(`/guilds/templates/${code}`);
