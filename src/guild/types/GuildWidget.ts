import { z } from "zod";

export const guildWidget = z.object({
  /** whether the widget is enabled */
  enabled: z.boolean(),
  /** the widget channel id */
  channelId: z.string().min(1).nullable()
});

export type GuildWidget = z.infer<typeof guildWidget>;