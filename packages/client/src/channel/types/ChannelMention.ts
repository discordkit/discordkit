import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { channelTypeSchema } from "./ChannelType.ts";

export const channelMentionSchema = z.object({
  /** id of the channel */
  id: snowflake,
  /** id of the guild containing the channel */
  guildId: snowflake,
  /** the type of channel */
  type: channelTypeSchema,
  /** the name of the channel */
  name: z.string()
});

export type ChannelMention = z.infer<typeof channelMentionSchema>;
