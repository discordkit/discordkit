import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { LobbyMessage } from "./types/LobbyMessage.js";

export const getLobbyMessagesSchema = v.object({
  lobby: snowflake,
  params: v.exactOptional(
    v.partial(
      v.object({
        /** max number of messages to return (1-200). Defaults to 50. */
        limit: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(200))
      })
    )
  )
});

/**
 * ### [Get Lobby Messages](https://discord.com/developers/docs/resources/lobby#get-lobby-messages)
 *
 * **GET** `/lobbies/:lobby/messages`
 *
 * Returns the most recent messages in the specified lobby. The calling user must be a member of the lobby.
 *
 * Uses `Bearer` token for authorization with the `sdk.social_layer` scope.
 *
 * Returns an array of {@link LobbyMessage | lobby message objects}.
 */
export const getLobbyMessages: Fetcher<
  typeof getLobbyMessagesSchema,
  LobbyMessage[]
> = async ({ lobby, params }) => get(`/lobbies/${lobby}/messages`, params);
