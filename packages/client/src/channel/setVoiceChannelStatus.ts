import * as v from "valibot";
import { put, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const setVoiceChannelStatusSchema = v.object({
  channel: snowflake,
  body: v.object({
    /** new voice channel status (up to 500 characters) */
    status: v.nullable(boundedString({ max: 500 }))
  })
});

/**
 * ### [Set Voice Channel Status](https://discord.com/developers/docs/resources/channel#set-voice-channel-status)
 *
 * **PUT** `/channels/:channel/voice-status`
 *
 * Set a voice channel's status. Requires the `SET_VOICE_CHANNEL_STATUS` permission, and additionally the `MANAGE_CHANNELS` permission if the current user is not connected to the voice channel. Fires a Voice Channel Status Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const setVoiceChannelStatus: Fetcher<
  typeof setVoiceChannelStatusSchema,
  void,
  { auditLogReason: true }
> = async ({ channel, body }, options) =>
  put(`/channels/${channel}/voice-status`, body, options);
