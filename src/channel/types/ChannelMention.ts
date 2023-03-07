import type { ChannelType } from "./ChannelType";

export interface ChannelMention {
  /** id of the channel */
  id: string;
  /** id of the guild containing the channel */
  guildId: string;
  /** the type of channel */
  type: ChannelType;
  /** the name of the channel */
  name: string;
}
