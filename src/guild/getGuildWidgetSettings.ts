import type { QueryBuilder } from "../utils";
import { get } from "../utils";
import type { GuildWidget } from "./types";

/**
 * Returns a guild widget settings object. Requires the `MANAGE_GUILD` permission.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-widget-settings
 */
export const getGuildWidgetSettings: QueryBuilder<{ guild: string }, GuildWidget> = ({ guild }) =>
  get(`/guilds/${guild}/widget`);
