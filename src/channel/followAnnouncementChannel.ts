import { z } from "zod";
import { post, type Fetcher, toProcedure, toValidated } from "#/utils/index.ts";
import {
  followedChannelSchema,
  type FollowedChannel
} from "./types/FollowedChannel.ts";

export const followAnnouncementChannelSchema = z.object({
  channel: z.string().min(1),
  body: z.object({
    /** id of target channel */
    webhookChannelId: z.string().min(1)
  })
});

/**
 * ### [Follow Announcement Channel](https://discord.com/developers/docs/resources/channel#follow-announcement-channel)
 *
 * **POST** `/channels/:channel/followers`
 *
 * Follow an Announcement Channel to send messages to a target channel. Requires the `MANAGE_WEBHOOKS` permission in the target channel. Returns a {@link FollowedChannel | followed channel object}. Fires a Webhooks Update Gateway event for the target channel.
 */
export const followAnnouncementChannel: Fetcher<
  typeof followAnnouncementChannelSchema,
  FollowedChannel
> = async ({ channel, body }) => post(`/channels/${channel}/followers`, body);

export const followAnnouncementChannelSafe = toValidated(
  followAnnouncementChannel,
  followAnnouncementChannelSchema,
  followedChannelSchema
);

export const followAnnouncementChannelProcedure = toProcedure(
  `mutation`,
  followAnnouncementChannel,
  followAnnouncementChannelSchema,
  followedChannelSchema
);
