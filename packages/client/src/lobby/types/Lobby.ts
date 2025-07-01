import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { guildTextChannelSchema } from "../../channel/types/Channel.js";
import { ChannelType } from "../../channel/types/ChannelType.js";
import { lobbyMemberSchema } from "./LobbyMember.js";

/** Represents a lobby within Discord. See [Managing Lobbies](https://discord.com/developers/docs/discord-social-sdk/development-guides/managing-lobbies) for more information. */
export const lobbySchema = v.object({
  /** the id of this channel */
  id: snowflake,
  /** application that created the lobby */
  applicationId: snowflake,
  /** dictionary of string key/value pairs. The max total length is 1000 */
  metadata: v.nullable(
    v.pipe(v.record(v.string(), v.string()), v.maxEntries(1000))
  ),
  /** members of the lobby */
  members: v.array(lobbyMemberSchema),
  /** the guild channel linked to the lobby */
  linkedChannel: v.exactOptional(
    v.object({
      ...guildTextChannelSchema.entries,
      type: v.literal(ChannelType.GUILD_TEXT),
      nsfw: v.literal(false)
    })
  )
});

export interface Lobby extends v.InferOutput<typeof lobbySchema> {}
