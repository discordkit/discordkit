import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  asInteger
} from "@discordkit/core";
import { lobbySchema, type Lobby } from "./types/Lobby.js";
import { lobbyMemberFlag } from "./types/LobbyMemberFlags.js";

export const modifyLobbySchema = v.object({
  lobby: snowflake,
  body: v.partial(
    v.object({
      /** optional dictionary of string key/value pairs. The max total length is 1000. */
      metadata: v.nullish(
        v.pipe(v.record(v.string(), v.string()), v.maxEntries(1000))
      ),
      /** optional array of up to 25 users to replace the lobby members with. If provided, lobby members not in this list will be removed from the lobby. */
      members: v.pipe(
        v.array(
          v.object({
            /** Discord user id of the user to add to the lobby */
            id: snowflake,
            /** optional dictionary of string key/value pairs. The max total length is 1000. */
            metadata: v.nullish(
              v.pipe(v.record(v.string(), v.string()), v.maxEntries(1000))
            ),
            /** lobby member flags combined as a bitfield */
            flags: v.exactOptional(
              asInteger(lobbyMemberFlag) as v.GenericSchema<number>
            )
          })
        ),
        v.maxLength(25)
      ),
      /** seconds to wait before shutting down a lobby after it becomes idle. Value can be between 5 and 604800 (7 days). See [`LobbyHandle`](https://discord.com/developers/docs/social-sdk/classdiscordpp_1_1LobbyHandle.html#a04cebab69ab0e7fb930346a14a87e843) for more details on this behavior. */
      idleTimeoutSeconds: v.pipe(
        v.number(),
        v.integer(),
        v.minValue(5),
        v.maxValue(604800)
      )
    })
  )
});

/**
 * ### [Modify Lobby](https://discord.com/developers/docs/resources/lobby#modify-lobby)
 *
 * **PATCH** `/lobbies/:lobby`
 *
 * Modifies the specified lobby with new values, if provided.
 *
 * Returns the updated lobby object.
 */
export const modifyLobby: Fetcher<typeof modifyLobbySchema, Lobby> = async ({
  lobby,
  body
}) => patch(`/lobbies/${lobby}`, body);

export const modifyLobbySafe = toValidated(
  modifyLobby,
  modifyLobbySchema,
  lobbySchema
);

export const modifyLobbyProcedure = toProcedure(
  `mutation`,
  modifyLobby,
  modifyLobbySchema,
  lobbySchema
);
