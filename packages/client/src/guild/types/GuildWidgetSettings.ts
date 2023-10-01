import { snowflake } from "@discordkit/core";
import { z } from "zod";

export const guildWidgetSettingsSchema = z.object({
  /** whether the widget is enabled */
  enabled: z.boolean(),
  /** the widget channel id */
  channelId: snowflake.optional()
});

export type GuildWidgetSettings = z.infer<typeof guildWidgetSettingsSchema>;
