import { snowflake } from "@discordkit/core";
import { z } from "zod";

export const welcomeChannelSchema = z.object({
  /** the channel's id */
  channelId: snowflake,
  /** the description shown for the channel */
  description: z.string().min(1),
  /** the emoji id, if the emoji is custom */
  emojiId: snowflake.optional(),
  /** the emoji name if custom, the unicode character if standard, or null if no emoji is set */
  emojiName: z.string().min(1).optional()
});

export type WelcomeChannel = z.infer<typeof welcomeChannelSchema>;
