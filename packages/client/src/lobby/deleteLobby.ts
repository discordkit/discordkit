import { object } from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteLobbySchema = object({
  lobby: snowflake
});

/**
 * ### [Delete Lobby](https://discord.com/developers/docs/resources/lobby#delete-lobby)
 *
 * **DELETE** `/lobbies/:lobby`
 *
 * Deletes the specified lobby if it exists.
 *
 * It is safe to call even if the lobby is already deleted as well.
 *
 * Returns nothing.
 */
export const deleteLobby: Fetcher<typeof deleteLobbySchema> = async ({
  lobby
}) => remove(`/lobbies/${lobby}`);

export const deleteLobbySafe = toValidated(deleteLobby, deleteLobbySchema);

export const deleteLobbyProcedure = toProcedure(
  `mutation`,
  deleteLobby,
  deleteLobbySchema
);
