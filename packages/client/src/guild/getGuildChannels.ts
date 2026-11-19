import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { Channel } from "../channel/types/Channel.js";

export const getGuildChannelsSchema = v.object({
  guild: snowflake
});

/**
 * ### [Get Guild Channels](https://discord.com/developers/docs/resources/guild#get-guild-channels)
 *
 * **GET** `/guilds/:guild/channels`
 *
 * Returns a list of guild {@link Channel | channel objects}. Does not include threads.
 *
 * > [!WARNING]
 * >
 * > This endpoint omits any channel your bot doesn't have permission to view. Permission to view a channel is defined by having `VIEW_CHANNEL` permission on a channel or by being connected to a voice channel. Channel categories are viewable if any of their child channels are viewable. See [Obfuscated Channels](https://discord.com/developers/docs/resources/channel#channel-object-obfuscated-channels) for more information.
 */
export const getGuildChannels: Fetcher<
  typeof getGuildChannelsSchema,
  Channel[]
> = async ({ guild }) => get(`/guilds/${guild}/channels`);
