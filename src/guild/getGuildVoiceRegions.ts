import { z } from "zod";
import { get, type Fetcher, createProcedure } from "../utils";
import { voiceRegionSchema, type VoiceRegion } from "../voice";

export const getGuildVoiceRegionsSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a list of voice region objects for the guild. Unlike the similar `/voice` route, this returns VIP servers when the guild is VIP-enabled.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-voice-regions
 */
export const getGuildVoiceRegions: Fetcher<
  typeof getGuildVoiceRegionsSchema,
  VoiceRegion
> = async ({ guild }) => get(`/guilds/${guild}/regions`);

export const getGuildVoiceRegionsProcedure = createProcedure(
  `query`,
  getGuildVoiceRegions,
  getGuildVoiceRegionsSchema,
  voiceRegionSchema
);
