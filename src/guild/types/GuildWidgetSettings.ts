import { z } from "zod";

export const guildWidgetSettingsSchema = z.object({
  /** whether the widget is enabled */
  enabled: z.boolean(),
  /** the widget channel id */
  channelId: z.string().min(1).optional()
});

export type GuildWidgetSettings = z.infer<typeof guildWidgetSettingsSchema>;
