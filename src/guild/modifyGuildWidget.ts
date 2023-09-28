import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "#/utils/index.ts";
import {
  guildWidgetSettingsSchema,
  type GuildWidgetSettings
} from "./types/GuildWidgetSettings.ts";

export const modifyGuildWidgetSchema = z.object({
  guild: z.string().min(1),
  body: guildWidgetSettingsSchema.partial()
});

/**
 * ### [Modify Guild Widget](https://discord.com/developers/docs/resources/guild#modify-guild-widget)
 *
 * **PATCH** `/guilds/:guild/widget`
 *
 * Modify a guild widget settings object for the guild. All attributes may be passed in with JSON and modified. Requires the `MANAGE_GUILD` permission. Returns the updated {@link GuildWidgetSettings | guild widget settings object}.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyGuildWidget: Fetcher<
  typeof modifyGuildWidgetSchema,
  GuildWidgetSettings
> = async ({ guild, body }) => patch(`/guilds/${guild}/widget`, body);

export const modifyGuildWidgetProcedure = toProcedure(
  `mutation`,
  modifyGuildWidget,
  modifyGuildWidgetSchema,
  guildWidgetSettingsSchema
);
