import * as v from "valibot";
import { patch, type Fetcher, snowflake } from "@discordkit/core";
import { type Lobby } from "./types/Lobby.js";

export const linkChannelToLobbySchema = v.object({
  lobby: snowflake,
  body: v.partial(
    v.object({
      /** the id of the channel to link to the lobby. If not provided, will unlink any currently linked channels from the lobby. */
      channelId: snowflake
    })
  )
});

/**
 * ### [Link Channel to Lobby](https://discord.com/developers/docs/resources/lobby#link-channel-to-lobby)
 *
 * **PATCH** `/lobbies/:lobby/channel-linking`
 *
 * Links an existing text channel to a lobby. See [Linked Channels](https://discord.com/developers/docs/discord-social-sdk/development-guides/linked-channels) for more information.
 *
 * Uses `Bearer` token for authorization and user must be a {@link LobbyMember | lobby member} with `CanLinkLobby` {@link LobbyMember | lobby member} flag.
 *
 * Returns a lobby object with a linked channel.
 */
export const linkChannelToLobby: Fetcher<
  typeof linkChannelToLobbySchema,
  Lobby & Required<Pick<Lobby, `linkedChannel`>>
> = async ({ lobby, body }) => patch(`/lobbies/${lobby}/channel-linking`, body);
