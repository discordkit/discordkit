import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  voiceRegionSchema,
  type VoiceRegion
} from "../voice/types/VoiceRegion.ts";

export const getGuildVoiceRegionsSchema = z.object({
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

export const getGuildVoiceRegionsSafe = toValidated(
  getGuildVoiceRegions,
  getGuildVoiceRegionsSchema,
  voiceRegionSchema
);

export const getGuildVoiceRegionsProcedure = toProcedure(
  `query`,
  getGuildVoiceRegions,
  getGuildVoiceRegionsSchema,
  voiceRegionSchema
);

export const getGuildVoiceRegionsQuery = toQuery(getGuildVoiceRegions);
