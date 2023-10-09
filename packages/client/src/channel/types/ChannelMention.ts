import { object, string, type Output } from "valibot";
import { snowflake } from "@discordkit/core";
import { channelTypeSchema } from "./ChannelType.js";

export const channelMentionSchema = object({
  /** id of the channel */
  id: snowflake,
  /** id of the guild containing the channel */
  guildId: snowflake,
  /** the type of channel */
  type: channelTypeSchema,
  /** the name of the channel */
  name: string()
});

export type ChannelMention = Output<typeof channelMentionSchema>;
