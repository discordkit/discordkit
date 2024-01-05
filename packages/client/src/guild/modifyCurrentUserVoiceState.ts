import {
  boolean,
  isoTimestamp,
  nullish,
  object,
  partial,
  string
} from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const modifyCurrentUserVoiceStateSchema = object({
  guild: snowflake,
  body: partial(
    object({
      /** the id of the channel the user is currently in */
      channelId: nullish(snowflake),
      /** toggles the user's suppress state */
      suppress: nullish(boolean()),
      /** sets the user's request to speak */
      requestToSpeakTimestamp: nullish(string([isoTimestamp()]))
    })
  )
});

/**
 * ### [Modify Current User Voice State](https://discord.com/developers/docs/resources/guild#modify-current-user-voice-state)
 *
 * **PATCH** `/guilds/:guild/voice-states/@me`
 *
 * Updates the current user's voice state. Returns `204 No Content` on success. Fires a Voice State Update Gateway event.
 */
export const modifyCurrentUserVoiceState: Fetcher<
  typeof modifyCurrentUserVoiceStateSchema
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
