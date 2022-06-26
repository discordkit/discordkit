import { z } from "zod";
import { get, query } from "../utils";
import type { VoiceRegion } from "../voice";

export const getGuildVoiceRegionsSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a list of voice region objects for the guild. Unlike the similar `/voice` route, this returns VIP servers when the guild is VIP-enabled.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-voice-regions
 */
export const getGuildVoiceRegions = query(getGuildVoiceRegionsSchema, ({ guild }) =>
  get<VoiceRegion>(`/guilds/${guild}/regions`)
);
