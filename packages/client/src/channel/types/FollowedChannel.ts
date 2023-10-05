import { snowflake } from "@discordkit/core";
import { z } from "zod";

export const followedChannelSchema = z.object({
  /** source channel id */
  channelId: snowflake,
  /** created target webhook id */
  webhookId: snowflake
});

export type FollowedChannel = z.infer<typeof followedChannelSchema>;
