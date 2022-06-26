import { z } from "zod";
import type { Channel } from "../channel";
import { get, query } from "../utils";

export const getGuildChannelsSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a list of guild channel objects. Does not include threads.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-channels
 */
export const getGuildChannels = query(getGuildChannelsSchema, ({ guild }) =>
  get<Channel[]>(`/guilds/${guild}/channels`)
);
