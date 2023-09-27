import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "../utils";

export const modifyCurrentUserVoiceStateSchema = z.object({
  guild: z.string().min(1),
  body: z
    .object({
      /** the id of the channel the user is currently in */
      channelId: z.string().min(1).nullable(),
      /** toggles the user's suppress state */
      suppress: z.boolean().nullable(),
      /** sets the user's request to speak */
      requestToSpeakTimestamp: z.string().datetime().nullable().optional()
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

export const modifyCurrentUserVoiceStateProcedure = toProcedure(
  `mutation`,
  modifyCurrentUserVoiceState,
  modifyCurrentUserVoiceStateSchema
);
