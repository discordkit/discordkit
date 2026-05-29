import * as v from "valibot";
import { patch, type Fetcher, snowflake } from "@discordkit/core";
import type { VoiceState } from "./types/VoiceState.js";

export const modifyUserVoiceStateSchema = v.object({
  guild: snowflake,
  user: snowflake,
  body: v.object({
    /** the id of the channel the user is currently in */
    channelId: snowflake,
    /** toggles the user's suppress state */
    suppress: v.exactOptional(v.boolean())
  })
});

/**
 * ### [Modify Current User Voice State](https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state)
 *
 * **PATCH** `/guilds/:guild/voice-states/@me`
 *
 * Updates the current user's voice state. Returns `204 No Content` on success. Fires a Voice State Update Gateway event.
 *
 * **Caveats**
 *
 * There are currently several caveats for this endpoint:
 *
 * - `channel_id` must currently point to a stage channel.
 * - current user must already have joined `channel_id`.
 * - You must have the `MUTE_MEMBERS` permission to unsuppress yourself. You can always suppress yourself.
 * - You must have the `REQUEST_TO_SPEAK` permission to request to speak. You can always clear your own request to speak.
 * - You are able to set `request_to_speak_timestamp` to any present or future time.
 */
export const modifyUserVoiceState: Fetcher<
  typeof modifyUserVoiceStateSchema,
  VoiceState
> = async ({ guild, user, body }) =>
  patch(`/guilds/${guild}/voice-states/${user}`, body);
