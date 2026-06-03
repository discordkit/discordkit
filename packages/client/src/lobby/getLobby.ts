import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type Lobby } from "./types/Lobby.js";

export const getLobbySchema = v.object({
  lobby: snowflake
});

/**
 * ### [Get Lobby](https://discord.com/developers/docs/resources/lobby#get-lobby)
 *
 * **GET** `/lobbies/:lobby`
 *
 * Returns a lobby object for the specified lobby id, if it exists.
 */
export const getLobby: Fetcher<typeof getLobbySchema, Lobby> = async ({
  lobby
}) => get(`/lobbies/${lobby}`);
