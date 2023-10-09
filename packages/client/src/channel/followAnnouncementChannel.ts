import { object } from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  followedChannelSchema,
  type FollowedChannel
} from "./types/FollowedChannel.js";

export const followAnnouncementChannelSchema = object({
  channel: snowflake,
  body: object({
    /** id of target channel */
    webhookChannelId: snowflake
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
