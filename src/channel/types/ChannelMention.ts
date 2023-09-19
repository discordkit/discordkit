import { z } from "zod";
import { channelTypeSchema } from "./ChannelType";

export const channelMentionSchema = z.object({
  /** id of the channel */
  id: z.string(),
  /** id of the guild containing the channel */
  guildId: z.string(),
  /** the type of channel */
  type: channelTypeSchema,
  /** the name of the channel */
  name: z.string()
});

export type ChannelMention = z.infer<typeof channelMentionSchema>;
