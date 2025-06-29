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

export const getUserVoiceStateSchema = object({
  guild: snowflake,
  user: snowflake
});

/**
 * ### [Get User Voice State](https://discord.com/developers/docs/resources/voice#get-user-voice-state)
 *
 * **GET** `/guilds/:guild/voice-states/:user`
 *
 * Returns the specified user's voice state in the guild.
 */
export const getUserVoiceState: Fetcher<
  typeof getUserVoiceStateSchema,
  VoiceState
> = async ({ guild, user }) => get(`/guilds/${guild}/voice-states/${user}`);

export const getUserVoiceStateSafe = toValidated(
  getUserVoiceState,
  getUserVoiceStateSchema,
  voiceStateSchema
);

export const getUserVoiceStateProcedure = toProcedure(
  `query`,
  getUserVoiceState,
  getUserVoiceStateSchema,
  voiceStateSchema
);

export const getUserVoiceStateQuery = toQuery(getUserVoiceState);
