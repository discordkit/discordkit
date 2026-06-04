import * as v from "valibot";
import { patch, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type Lobby } from "./types/Lobby.js";

export const unlinkChannelFromLobbySchema = v.object({
  lobby: snowflake
});

/**
 * ### [Unlink Channel from Lobby](https://discord.com/developers/docs/resources/lobby#unlink-channel-from-lobby)
 *
 * **PATCH** `/lobbies/:lobby/channel-linking`
 *
 * Unlinks any currently linked channels from the specified lobby.
 *
 * Send a request to this endpoint with an empty body to unlink any currently linked channels from the specified lobby.
 *
 * Uses `Bearer` token for authorization and user must be a {@link LobbyMember | lobby member} with `CanLinkLobby` {@link LobbyMember | lobby member} flag.
 *
 * Returns a lobby object without a linked channel.
 */
export const unlinkChannelFromLobby: Fetcher<
  typeof unlinkChannelFromLobbySchema,
  Omit<Lobby, `linkedChannel`>
> = async ({ lobby }) => patch(`/lobbies/${lobby}/channel-linking`);
