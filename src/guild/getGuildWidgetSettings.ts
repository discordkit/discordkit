import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { guildWidgetSchema, type GuildWidget } from "./types/GuildWidget";

export const getGuildWidgetSettingsSchema = z.object({ guild: z.string() });

/**
 * Returns a guild widget settings object. Requires the `MANAGE_GUILD` permission.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-widget-settings
 */
export const getGuildWidgetSettings: Fetcher<
  typeof getGuildWidgetSettingsSchema,
  GuildWidget
> = async ({ guild }) => get(`/guilds/${guild}/widget`);

export const getGuildWidgetSettingsProcedure = toProcedure(
  `query`,
  getGuildWidgetSettings,
  getGuildWidgetSettingsSchema,
  guildWidgetSchema
);

export const getGuildWidgetSettingsQuery = toQuery(getGuildWidgetSettings);
