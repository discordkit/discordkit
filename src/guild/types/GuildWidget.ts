import { z } from "zod";
import { channelSchema } from "../../channel/types/Channel";
import { userSchema } from "../../user";

export const guildWidgetSchema = z.object({
  /** guild id */
  id: z.string().min(1),
  /** guild name (2-100 characters) */
  name: z.string().min(2).max(100),
  /** instant invite for the guilds specified widget invite channel */
  instantInvite: z.string().min(1).optional(),
  /** voice and stage channels which are accessible by @everyone */
  channels: channelSchema.partial().array(),
  /** special widget user objects that includes users presence (Limit 100) */
  members: userSchema.partial().array().max(100),
  /** number of online members in this guild */
  presenceCount: z.number().int().positive()
});

export type GuildWidget = z.infer<typeof guildWidgetSchema>;
