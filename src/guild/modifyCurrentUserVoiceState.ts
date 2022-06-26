import { z } from "zod";
import { mutation, patch } from "../utils";

export const modifyCurrentUserVoiceStateSchema = z.object({
  guild: z.string().min(1),
  body: z.object({
    /** the id of the channel the user is currently in */
    channelId: z.string().min(1),
    /** toggles the user's suppress state */
    suppress: z.boolean().optional(),
    /** sets the user's request to speak */
    requestToSpeakTimestamp: z.string().min(1).nullable()
  })
});

/**
 * Updates the current user's voice state. Returns `204 No Content` on success.
 *
 * https://discord.com/developers/docs/resources/guild#modify-current-user-voice-state
 */
export const modifyCurrentUserVoiceState = mutation(modifyCurrentUserVoiceStateSchema, async ({ guild, body }) =>
  patch(`/guilds/${guild}/voice-states/@me`, body)
);
