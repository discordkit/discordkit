import { boolean, isoTimestamp, object, partial, pipe, string } from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import type { VoiceState } from "./types/VoiceState.js";

export const modifyCurrentUserVoiceStateSchema = object({
  guild: snowflake,
  body: partial(
    object({
      /** the id of the channel the user is currently in */
      channelId: snowflake,
      /** toggles the user's suppress state */
      suppress: boolean(),
      /** sets the user's request to speak */
      requestToSpeakTimestamp: pipe(string(), isoTimestamp())
    })
  )
});

/**
 * ### [Modify Current User Voice State](https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state)
 *
 * **PATCH** `/guilds/:guild/voice-states/@me`
 *
 * Updates the current user's voice state. Returns `204 No Content` on success. Fires a Voice State Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > **Caveats**
 * >
 * > There are currently several caveats for this endpoint:
 * >
 * > - `channelId` must currently point to a stage channel.
 * > - current user must already have joined `channelId`.
 * > - You must have the `MUTE_MEMBERS` permission to unsuppress yourself. You can always suppress yourself.
 * > - You must have the `REQUEST_TO_SPEAK` permission to request to speak. You can always clear your own request to speak.
 * > - You are able to set `requestToSpeakTimestamp` to any present or future time.
 */
export const modifyCurrentUserVoiceState: Fetcher<
  typeof modifyCurrentUserVoiceStateSchema,
  VoiceState
> = async ({ guild, body }) => patch(`/guilds/${guild}/voice-states/@me`, body);

export const modifyCurrentUserVoiceStateSafe = toValidated(
  modifyCurrentUserVoiceState,
  modifyCurrentUserVoiceStateSchema
);

export const modifyCurrentUserVoiceStateProcedure = toProcedure(
  `mutation`,
  modifyCurrentUserVoiceState,
  modifyCurrentUserVoiceStateSchema
);
