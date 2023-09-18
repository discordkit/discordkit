import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { GuildWidget } from "./types";

const getGuildWidgetSettingsSchema = z.object({ guild: z.string() });

/**
 * Returns a guild widget settings object. Requires the `MANAGE_GUILD` permission.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-widget-settings
 */
export const getGuildWidgetSettings: Fetcher<
  typeof getGuildWidgetSettingsSchema,
  GuildWidget
> = async ({ guild }) => get(`/guilds/${guild}/widget`);
