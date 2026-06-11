import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { VoiceRegion } from "../voice/types/VoiceRegion.js";

export const getGuildVoiceRegionsSchema = v.object({
  guild: snowflake
});

/**
 * ### [Get Guild Voice Regions](https://discord.com/developers/docs/resources/guild#get-guild-voice-regions)
 *
 * **GET** `/guilds/:guild/regions`
 *
 * Returns a list of {@link VoiceRegion | voice region objects} for the guild. Unlike the similar `/voice` route, this returns VIP servers when the guild is VIP-enabled.
 */
export const getGuildVoiceRegions: Fetcher<
  typeof getGuildVoiceRegionsSchema,
  VoiceRegion
> = async ({ guild }) => get(`/guilds/${guild}/regions`);
