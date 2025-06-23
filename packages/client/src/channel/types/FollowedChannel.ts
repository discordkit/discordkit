import { snowflake } from "@discordkit/core";
import { object, type InferOutput } from "valibot";

export const followedChannelSchema = object({
  /** source channel id */
  channelId: snowflake,
  /** created target webhook id */
  webhookId: snowflake
});

export type FollowedChannel = InferOutput<typeof followedChannelSchema>;
