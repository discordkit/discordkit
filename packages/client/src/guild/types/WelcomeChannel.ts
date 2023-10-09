import { snowflake } from "@discordkit/core";
import { type Output, object, string, minLength, optional } from "valibot";

export const welcomeChannelSchema = object({
  /** the channel's id */
  channelId: snowflake,
  /** the description shown for the channel */
  description: string([minLength(1)]),
  /** the emoji id, if the emoji is custom */
  emojiId: optional(snowflake),
  /** the emoji name if custom, the unicode character if standard, or null if no emoji is set */
  emojiName: optional(string([minLength(1)]))
});

export type WelcomeChannel = Output<typeof welcomeChannelSchema>;
