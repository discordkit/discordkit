import { z } from "zod";
import { channelType } from "./ChannelType";

export const channelMention = z.object({
  /** id of the channel */
  id: z.string(),
  /** id of the guild containing the channel */
  guildId: z.string(),
  /** the type of channel */
  type: channelType,
  /** the name of the channel */
  name: z.string()
});

export type ChannelMention = z.infer<typeof channelMention>;
