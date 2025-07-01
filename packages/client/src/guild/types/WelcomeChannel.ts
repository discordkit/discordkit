import * as v from "valibot";
import { snowflake } from "@discordkit/core";

export const welcomeChannelSchema = v.object({
  /** the channel's id */
  channelId: snowflake,
  /** the description shown for the channel */
  description: v.pipe(v.string(), v.nonEmpty()),
  /** the emoji id, if the emoji is custom */
  emojiId: v.nullable(snowflake),
  /** the emoji name if custom, the unicode character if standard, or null if no emoji is set */
  emojiName: v.nullable(v.pipe(v.string(), v.nonEmpty()))
});

export interface WelcomeChannel
  extends v.InferOutput<typeof welcomeChannelSchema> {}
