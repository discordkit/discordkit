import { object } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { voiceStateSchema, type VoiceState } from "./types/VoiceState.js";

export const getCurrentUserVoiceStateSchema = object({
  guild: snowflake
});

/**
 * ### [Get Current User Voice State](https://discord.com/developers/docs/resources/voice#get-current-user-voice-state)
 *
 * **GET** `/guilds/:guild/voice-states/@me`
 *
 * Returns the current user's voice state in the guild.
 */
export const getCurrentUserVoiceState: Fetcher<
  typeof getCurrentUserVoiceStateSchema,
  VoiceState
> = async ({ guild }) => get(`/guilds/${guild}/voice-states/@me`);

export const getCurrentUserVoiceStateSafe = toValidated(
  getCurrentUserVoiceState,
  getCurrentUserVoiceStateSchema,
  voiceStateSchema
);

export const getCurrentUserVoiceStateProcedure = toProcedure(
  `query`,
  getCurrentUserVoiceState,
  getCurrentUserVoiceStateSchema,
  voiceStateSchema
);

export const getCurrentUserVoiceStateQuery = toQuery(getCurrentUserVoiceState);
