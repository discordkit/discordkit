import { object } from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const leaveLobbySchema = object({
  lobby: snowflake
});

/**
 * ### [Leave Lobby](https://discord.com/developers/docs/resources/lobby#leave-lobby)
 *
 * **DELETE** `/lobbies/:lobby/members/@me`
 *
 * Removes the current user from the specified lobby. It is safe to call this even if the user is no longer a member of the lobby, but will fail if the lobby does not exist.
 *
 * Uses `Bearer` token for authorization.
 *
 * Returns nothing.
 */
export const leaveLobby: Fetcher<typeof leaveLobbySchema> = async ({ lobby }) =>
  remove(`/lobbies/${lobby}/members/@me`);

export const leaveLobbySafe = toValidated(leaveLobby, leaveLobbySchema);

export const leaveLobbyProcedure = toProcedure(
  `mutation`,
  leaveLobby,
  leaveLobbySchema
);
