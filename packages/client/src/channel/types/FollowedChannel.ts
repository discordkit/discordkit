import * as v from "valibot";
import { snowflake } from "@discordkit/core";

export const followedChannelSchema = v.object({
  /** source channel id */
  channelId: snowflake as v.GenericSchema<string>,
  /** created target webhook id */
  webhookId: snowflake as v.GenericSchema<string>
});

export interface FollowedChannel
  extends v.InferOutput<typeof followedChannelSchema> {}
