import { z } from "zod";
import { get, type Fetcher, createProcedure } from "../utils";
import { guildWidgetSchema, type GuildWidget } from "./types";

export const getGuildWidgetSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns the widget for the guild.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-widget
 */
export const getGuildWidget: Fetcher<
  typeof getGuildWidgetSchema,
  GuildWidget
> = async ({ guild }) => get(`/guilds/${guild}/widget.json`);

export const getGuildWidgetProcedure = createProcedure(
  `query`,
  getGuildWidget,
  getGuildWidgetSchema,
  guildWidgetSchema
);
