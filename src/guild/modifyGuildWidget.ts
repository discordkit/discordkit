import { z } from "zod";
import { mutation, patch } from "../utils";
import type { GuildWidget } from "./types";
import { guildWidget } from "./types";

export const modifyGuildWidgetScehma = z.object({
  guild: z.string().min(1),
  body: guildWidget.partial()
});

/**
 * Modify a guild widget settings object for the guild. All attributes may be passed in with JSON and modified. Requires the `MANAGE_GUILD` permission. Returns the updated guild widget object.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#modify-guild-widget
 */
export const modifyGuildWidget = mutation(modifyGuildWidgetScehma, async ({ guild, body }) =>
  patch<GuildWidget>(`/guilds/${guild}/widget`, body)
);
