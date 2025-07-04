import * as v from "valibot";
import { snowflake } from "@discordkit/core";

export const followedChannelSchema = v.object({
  /** source channel id */
  channelId: snowflake,
  /** created target webhook id */
  webhookId: snowflake
});

export interface FollowedChannel
  extends v.InferOutput<typeof followedChannelSchema> {}
