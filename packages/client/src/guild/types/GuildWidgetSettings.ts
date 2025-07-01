import { snowflake } from "@discordkit/core";
import { object, nullable, boolean, type InferOutput } from "valibot";

export const guildWidgetSettingsSchema = object({
  /** whether the widget is enabled */
  enabled: boolean(),
  /** the widget channel id */
  channelId: nullable(snowflake)
});

export interface GuildWidgetSettings
  extends InferOutput<typeof guildWidgetSettingsSchema> {}
