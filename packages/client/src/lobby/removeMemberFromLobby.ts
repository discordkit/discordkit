import * as v from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const removeMemberFromLobbySchema = v.object({
  lobby: snowflake,
  user: snowflake
});

/**
 * ### [Remove a Member from a Lobby](https://discord.com/developers/docs/resources/lobby#remove-a-member-from-a-lobby)
 *
 * **DELETE** `/lobbies/:lobby/members/:user`
 *
 * Removes the provided user from the specified lobby. It is safe to call this even if the user is no longer a member of the lobby, but will fail if the lobby does not exist.
 *
 * Returns nothing.
 */
export const removeMemberFromLobby: Fetcher<
  typeof removeMemberFromLobbySchema
> = async ({ lobby, user }) => remove(`/lobbies/${lobby}/members/${user}`);

export const removeMemberFromLobbySafe = toValidated(
  removeMemberFromLobby,
  removeMemberFromLobbySchema
);

export const removeMemberFromLobbyProcedure = toProcedure(
  `mutation`,
  removeMemberFromLobby,
  removeMemberFromLobbySchema
);
