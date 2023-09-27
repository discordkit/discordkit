import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import {
  voiceRegionSchema,
  type VoiceRegion
} from "../voice/types/VoiceRegion";

export const getGuildVoiceRegionsSchema = z.object({
  guild: z.string().min(1)
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

export const getGuildVoiceRegionsProcedure = toProcedure(
  `query`,
  getGuildVoiceRegions,
  getGuildVoiceRegionsSchema,
  voiceRegionSchema
);

export const getGuildVoiceRegionsQuery = toQuery(getGuildVoiceRegions);
