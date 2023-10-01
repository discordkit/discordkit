import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated
} from "@discordkit/core";

export const modifyUserVoiceStateSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1),
  body: z.object({
    /** the id of the channel the user is currently in */
    channelId: z.string().min(1),
    /** toggles the user's suppress state */
    suppress: z.boolean().nullable()
  })
});

/**
 * ### [Modify User Voice State](https://discord.com/developers/docs/resources/guild#modify-user-voice-state)
 *
 * **PATCH** `/guilds/:guild/voice-states/:user`
 *
 * Updates another user's voice state. Fires a Voice State Update Gateway event.
 */
export const modifyUserVoiceState: Fetcher<
  typeof modifyUserVoiceStateSchema
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
