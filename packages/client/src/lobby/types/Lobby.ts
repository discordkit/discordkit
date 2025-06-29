import {
  array,
  exactOptional,
  maxEntries,
  nullable,
  object,
  pipe,
  record,
  string,
  literal,
  type InferOutput
} from "valibot";
import { snowflake } from "@discordkit/core";
import { guildTextChannelSchema } from "../../channel/types/Channel.js";
import { ChannelType } from "../../channel/types/ChannelType.js";
import { lobbyMemberSchema } from "./LobbyMember.js";

/** Represents a lobby within Discord. See [Managing Lobbies](https://discord.com/developers/docs/discord-social-sdk/development-guides/managing-lobbies) for more information. */
export const lobbySchema = object({
  /** the id of this channel */
  id: snowflake,
  /** application that created the lobby */
  applicationId: snowflake,
  /** dictionary of string key/value pairs. The max total length is 1000 */
  metadata: nullable(pipe(record(string(), string()), maxEntries(1000))),
  /** members of the lobby */
  members: array(lobbyMemberSchema),
  /** the guild channel linked to the lobby */
  linkedChannel: exactOptional(
    object({
      ...guildTextChannelSchema.entries,
      type: literal(ChannelType.GUILD_TEXT),
      nsfw: literal(false)
    })
  )
});

export type Lobby = InferOutput<typeof lobbySchema>;
