import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "../utils";

export const modifyUserVoiceStateSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1),
  body: z.object({
    /** the id of the channel the user is currently in */
    channelId: z.string().min(1),
    /** toggles the user's suppress state */
    suppress: z.boolean().optional()
  })
});

/**
 * Updates another user's voice state. Returns `204 No Content` on success.
 *
 * https://discord.com/developers/docs/resources/guild#modify-user-voice-state
 */
export const modifyUserVoiceState: Fetcher<
  typeof modifyUserVoiceStateSchema
> = async ({ guild, user, body }) =>
  patch(`/guilds/${guild}/voice-states/${user}`, body);

export const modifyUserVoiceStateProcedure = toProcedure(
  `mutation`,
  modifyUserVoiceState,
  modifyUserVoiceStateSchema
);
