import * as v from "valibot";
import { put, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import type { Lobby } from "./types/Lobby.js";

export const createOrJoinLobbySchema = v.object({
  body: v.object({
    /** secret used to identify the lobby. If a lobby for this application already exists with this secret, the caller joins it; otherwise a new lobby is created. Max 250 characters. */
    secret: boundedString({ max: 250 }),
    /** seconds to wait before shutting down a lobby after it becomes idle. Value can be between 5 and 604800 (7 days). See [`LobbyHandle`](https://discord.com/developers/docs/social-sdk/classdiscordpp_1_1LobbyHandle.html#a04cebab69ab0e7fb930346a14a87e843) for more details on this behavior. */
    idleTimeoutSeconds: v.exactOptional(
      v.pipe(v.number(), v.integer(), v.minValue(5), v.maxValue(604800))
    ),
    /** optional dictionary of string key/value pairs to set on the lobby. The max total length is 1000. Overwrites any existing lobby metadata. */
    lobbyMetadata: v.exactOptional(
      v.nullable(v.pipe(v.record(v.string(), v.string()), v.maxEntries(1000)))
    ),
    /** optional dictionary of string key/value pairs to set on the calling user's lobby member. The max total length is 1000. */
    memberMetadata: v.exactOptional(
      v.nullable(v.pipe(v.record(v.string(), v.string()), v.maxEntries(1000)))
    )
  })
});

/**
 * ### [Create or Join Lobby](https://discord.com/developers/docs/resources/lobby#create-or-join-lobby)
 *
 * **PUT** `/lobbies`
 *
 * Creates a new lobby for the application identified by a `secret`, or joins the calling user to the existing lobby with that secret if one already exists. Updates lobby metadata and the calling member's metadata on join.
 *
 * Uses `Bearer` token for authorization with the `sdk.social_layer` scope.
 *
 * Returns a {@link Lobby | lobby object}.
 */
export const createOrJoinLobby: Fetcher<
  typeof createOrJoinLobbySchema,
  Lobby
> = async ({ body }) => put(`/lobbies`, body);
