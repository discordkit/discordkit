import { boolean, object, exactOptional } from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import type { VoiceState } from "./types/VoiceState.js";

export const modifyUserVoiceStateSchema = object({
  guild: snowflake,
  user: snowflake,
  body: object({
    /** the id of the channel the user is currently in */
    channelId: snowflake,
    /** toggles the user's suppress state */
    suppress: exactOptional(boolean())
  })
});

/**
 * ### [Modify Current User Voice State](https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state)
 *
 * **PATCH** `/guilds/:guild/voice-states/:user`
 *
 * Updates another user's voice state. Fires a Voice State Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > **Caveats**
 * >
 * > There are currently several caveats for this endpoint:
 * >
 * > - `channelId` must currently point to a stage channel.
 * > - User must already have joined `channelId`.
 * > - You must have the `MUTE_MEMBERS` permission. (Since suppression is the only thing that is available currently.)
 * > - When unsuppressed, non-bot users will have their `requestToSpeakTimestamp` set to the current time. Bot users will not.
 * > - When suppressed, the user will have their `requestToSpeakTimestamp` removed.
 */
export const modifyUserVoiceState: Fetcher<
  typeof modifyUserVoiceStateSchema,
  VoiceState
> = async ({ guild, user, body }) =>
  patch(`/guilds/${guild}/voice-states/${user}`, body);

export const modifyUserVoiceStateSafe = toValidated(
  modifyUserVoiceState,
  modifyUserVoiceStateSchema
);

export const modifyUserVoiceStateProcedure = toProcedure(
  `mutation`,
  modifyUserVoiceState,
  modifyUserVoiceStateSchema
);
