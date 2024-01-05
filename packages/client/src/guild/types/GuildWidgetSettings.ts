import { snowflake } from "@discordkit/core";
import { object, optional, boolean, type Output } from "valibot";

export const guildWidgetSettingsSchema = object({
  /** whether the widget is enabled */
  enabled: boolean(),
  /** the widget channel id */
  channelId: optional(snowflake)
});

export type GuildWidgetSettings = Output<typeof guildWidgetSettingsSchema>;
