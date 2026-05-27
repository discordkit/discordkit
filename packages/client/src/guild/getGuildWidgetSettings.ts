import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type GuildWidgetSettings } from "./types/GuildWidgetSettings.js";

export const getGuildWidgetSettingsSchema = v.object({ guild: snowflake });

/**
 * ### [Get Guild Widget Settings](https://discord.com/developers/docs/resources/guild#get-guild-widget-settings)
 *
 * **GET** `/guilds/:guild/widget`
 *
 * Returns a {@link GuildWidgetSettings | guild widget settings object}. Requires the `MANAGE_GUILD` permission.
 */
export const getGuildWidgetSettings: Fetcher<
  typeof getGuildWidgetSettingsSchema,
  GuildWidgetSettings
> = async ({ guild }) => get(`/guilds/${guild}/widget`);
