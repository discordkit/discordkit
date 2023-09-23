import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "../utils";
import { guildWidgetSchema, type GuildWidget } from "./types";

export const modifyGuildWidgetSchema = z.object({
  guild: z.string().min(1),
  body: guildWidgetSchema.partial()
});

/**
 * Modify a guild widget settings object for the guild. All attributes may be passed in with JSON and modified. Requires the `MANAGE_GUILD` permission. Returns the updated guild widget object.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#modify-guild-widget
 */
export const modifyGuildWidget: Fetcher<
  typeof modifyGuildWidgetSchema,
  GuildWidget
> = async ({ guild, body }) => patch(`/guilds/${guild}/widget`, body);

export const modifyGuildWidgetProcedure = toProcedure(
  `mutation`,
  modifyGuildWidget,
  modifyGuildWidgetSchema,
  guildWidgetSchema
);
