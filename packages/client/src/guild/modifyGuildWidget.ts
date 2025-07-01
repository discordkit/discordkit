import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  guildWidgetSettingsSchema,
  type GuildWidgetSettings
} from "./types/GuildWidgetSettings.js";

export const modifyGuildWidgetSchema = v.object({
  guild: snowflake,
  body: v.partial(guildWidgetSettingsSchema)
});

/**
 * ### [Modify Guild Widget](https://discord.com/developers/docs/resources/guild#modify-guild-widget)
 *
 * **PATCH** `/guilds/:guild/widget`
 *
 * Modify a guild widget settings object for the guild. All attributes may be passed in with JSON and modified. Requires the `MANAGE_GUILD` permission. Returns the updated {@link GuildWidgetSettings | guild widget settings object}.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyGuildWidget: Fetcher<
  typeof modifyGuildWidgetSchema,
  GuildWidgetSettings
> = async ({ guild, body }) => patch(`/guilds/${guild}/widget`, body);

export const modifyGuildWidgetSafe = toValidated(
  modifyGuildWidget,
  modifyGuildWidgetSchema,
  guildWidgetSettingsSchema
);

export const modifyGuildWidgetProcedure = toProcedure(
  `mutation`,
  modifyGuildWidget,
  modifyGuildWidgetSchema,
  guildWidgetSettingsSchema
);
