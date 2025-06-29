import { object } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { lobbySchema, type Lobby } from "./types/Lobby.js";

export const getLobbySchema = object({
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

export const getLobbySafe = toValidated(getLobby, getLobbySchema, lobbySchema);

export const getLobbyProcedure = toProcedure(
  `query`,
  getLobby,
  getLobbySchema,
  lobbySchema
);

export const getLobbyQuery = toQuery(getLobby);
