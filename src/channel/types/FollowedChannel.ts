import { z } from "zod";

export const followedChannelSchema = z.object({
  /** source channel id */
  channelId: z.string(),
  /** created target webhook id */
  webhookId: z.string()
});

export type FollowedChannel = z.infer<typeof followedChannelSchema>;
