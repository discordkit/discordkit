import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import {
  guildWidgetSettingsSchema,
  type GuildWidgetSettings
} from "./types/GuildWidgetSettings";

export const getGuildWidgetSettingsSchema = z.object({ guild: z.string() });

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

export const getGuildWidgetSettingsProcedure = toProcedure(
  `query`,
  getGuildWidgetSettings,
  getGuildWidgetSettingsSchema,
  guildWidgetSettingsSchema
);

export const getGuildWidgetSettingsQuery = toQuery(getGuildWidgetSettings);
