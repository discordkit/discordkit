import { z } from "zod";
import { mutation, post } from "../utils";
import type { FollowedChannel } from "./types";

export const followNewsChannelSchema = z.object({
  channel: z.string().min(1),
  body: z.object({
    /** id of target channel */
    webhookChannelId: z.string().min(1)
  })
});

/**
 * Follow a News Channel to send messages to a target channel. Requires the `MANAGE_WEBHOOKS` permission in the target channel. Returns a followed channel object.
 *
 * https://discord.com/developers/docs/resources/channel#follow-news-channel
 */
export const followNewsChannel = mutation(
  followNewsChannelSchema,
  async ({ channel, body }) =>
    post<FollowedChannel>(`/channels/${channel}/followers`, body)
);
