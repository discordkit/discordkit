import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { VoiceState } from "./types/VoiceState.js";

export const getUserVoiceStateSchema = v.object({
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
