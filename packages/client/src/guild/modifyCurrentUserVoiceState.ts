import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const modifyCurrentUserVoiceStateSchema = z.object({
  guild: snowflake,
  body: z
    .object({
      /** the id of the channel the user is currently in */
      channelId: snowflake.nullish(),
      /** toggles the user's suppress state */
      suppress: z.boolean().nullish(),
      /** sets the user's request to speak */
      requestToSpeakTimestamp: z.string().datetime().nullish()
    })
    .partial()
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
