import { z } from "zod";
import { get, query } from "../utils";
import type { GuildWidget } from "./types";

export const getGuildWidgetSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns the widget for the guild.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-widget
 */
export const getGuildWidget = query(
  getGuildWidgetSchema,
  async ({ input: { guild } }) =>
    get<GuildWidget>(`/guilds/${guild}/widget.json`)
);
