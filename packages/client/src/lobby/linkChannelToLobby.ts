import { object, partial, required } from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { lobbySchema, type Lobby } from "./types/Lobby.js";

export const linkChannelToLobbySchema = object({
  lobby: snowflake,
  body: partial(
    object({
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
 * Uses `Bearer` token for authorization and user must be a lobby member with `CanLinkLobby` lobby member flag.
 *
 * Returns a lobby object with a linked channel.
 */
export const linkChannelToLobby: Fetcher<
  typeof linkChannelToLobbySchema,
  Lobby & Required<Pick<Lobby, `linkedChannel`>>
> = async ({ lobby, body }) => patch(`/lobbies/${lobby}/channel-linking`, body);

export const linkChannelToLobbySafe = toValidated(
  linkChannelToLobby,
  linkChannelToLobbySchema,
  required(lobbySchema, [`linkedChannel`])
);

export const linkChannelToLobbyProcedure = toProcedure(
  `mutation`,
  linkChannelToLobby,
  linkChannelToLobbySchema,
  required(lobbySchema, [`linkedChannel`])
);
