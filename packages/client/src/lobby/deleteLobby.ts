import * as v from "valibot";
import { remove, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const deleteLobbySchema = v.object({
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
