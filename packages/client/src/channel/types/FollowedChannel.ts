import { snowflake } from "@discordkit/core";
import { object, type InferOutput, type GenericSchema } from "valibot";

export const followedChannelSchema = object({
  /** source channel id */
  channelId: snowflake as GenericSchema<string>,
  /** created target webhook id */
  webhookId: snowflake as GenericSchema<string>
});

export interface FollowedChannel
  extends InferOutput<typeof followedChannelSchema> {}
