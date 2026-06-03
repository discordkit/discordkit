import * as v from "valibot";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { channelTypeSchema } from "../../channel/types/ChannelType.js";

/**
 * ### [Channel Mention](https://discord.com/developers/docs/resources/message#channel-mention-object)
 */
export const channelMentionSchema = v.object({
  /** id of the channel */
  id: snowflake,
  /** id of the guild containing the channel */
  guildId: snowflake,
  /** the type of channel */
  type: channelTypeSchema,
  /** the name of the channel */
  name: v.string()
});

export interface ChannelMention extends v.InferOutput<
  typeof channelMentionSchema
> {}
