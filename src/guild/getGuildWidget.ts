import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { guildWidgetSchema, type GuildWidget } from "./types/GuildWidget";

export const getGuildWidgetSchema = z.object({
  guild: z.string().min(1)
});

/**
 * ### [Get Guild Widget](https://discord.com/developers/docs/resources/guild#get-guild-widget)
 *
 * **GET** `/guilds/:guild/widget.json`
 *
 * Returns the {@link GuildWidget | widget} for the guild.
 */
export const getGuildWidget: Fetcher<
  typeof getGuildWidgetSchema,
  GuildWidget
> = async ({ guild }) => get(`/guilds/${guild}/widget.json`);

export const getGuildWidgetProcedure = toProcedure(
  `query`,
  getGuildWidget,
  getGuildWidgetSchema,
  guildWidgetSchema
);

export const getGuildWidgetQuery = toQuery(getGuildWidget);
