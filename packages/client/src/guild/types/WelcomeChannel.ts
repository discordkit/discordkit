import { snowflake } from "@discordkit/core";
import {
  type InferOutput,
  object,
  string,
  nonEmpty,
  nullable,
  pipe
} from "valibot";

export const welcomeChannelSchema = object({
  /** the channel's id */
  channelId: snowflake,
  /** the description shown for the channel */
  description: pipe(string(), nonEmpty()),
  /** the emoji id, if the emoji is custom */
  emojiId: nullable(snowflake),
  /** the emoji name if custom, the unicode character if standard, or null if no emoji is set */
  emojiName: nullable(pipe(string(), nonEmpty()))
});

export type WelcomeChannel = InferOutput<typeof welcomeChannelSchema>;
