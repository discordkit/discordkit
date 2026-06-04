import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type Channel } from "../channel/types/Channel.js";

export const getGuildChannelsSchema = v.object({
  guild: snowflake
});

/**
 * ### [Get Guild Channels](https://discord.com/developers/docs/resources/guild#get-guild-channels)
 *
 * **GET** `/guilds/:guild/channels`
 *
 * Returns a list of guild {@link Channel | channel objects}. Does not include threads.
 */
export const getGuildChannels: Fetcher<
  typeof getGuildChannelsSchema,
  Channel[]
> = async ({ guild }) => get(`/guilds/${guild}/channels`);
