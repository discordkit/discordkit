import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "@discordkit/core";
import {
  guildWidgetSettingsSchema,
  type GuildWidgetSettings
} from "./types/GuildWidgetSettings.ts";

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

export const getGuildWidgetSettingsSafe = toValidated(
  getGuildWidgetSettings,
  getGuildWidgetSettingsSchema,
  guildWidgetSettingsSchema
);

export const getGuildWidgetSettingsProcedure = toProcedure(
  `query`,
  getGuildWidgetSettings,
  getGuildWidgetSettingsSchema,
  guildWidgetSettingsSchema
);

export const getGuildWidgetSettingsQuery = toQuery(getGuildWidgetSettings);
