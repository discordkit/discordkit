import * as v from "valibot";
import { post, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type FollowedChannel } from "./types/FollowedChannel.js";

export const followAnnouncementChannelSchema = v.object({
  channel: snowflake,
  body: v.object({
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
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const followAnnouncementChannel: Fetcher<
  typeof followAnnouncementChannelSchema,
  FollowedChannel
> = async ({ channel, body }) => post(`/channels/${channel}/followers`, body);
