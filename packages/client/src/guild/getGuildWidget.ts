import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type GuildWidget } from "./types/GuildWidget.js";

export const getGuildWidgetSchema = v.object({
  guild: snowflake
});

/**
 * ### [Get Guild Widget](https://discord.com/developers/docs/resources/guild#get-guild-widget)
 *
 * **GET** `/guilds/:guild/widget.json`
 *
 * Returns the {@link GuildWidget | widget} for the guild. Fires an Invite Create Gateway event when an invite channel is defined and a new Invite is generated.
 */
export const getGuildWidget: Fetcher<
  typeof getGuildWidgetSchema,
  GuildWidget
> = async ({ guild }) => get(`/guilds/${guild}/widget.json`);
