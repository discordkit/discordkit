import * as v from "valibot";
import { post, type Fetcher } from "@discordkit/core/requests/methods";
import { asInteger } from "@discordkit/core/validations/asInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { Lobby } from "./types/Lobby.js";
import { lobbyMemberFlag } from "./types/LobbyMemberFlags.js";

export const createLobbySchema = v.object({
  body: v.partial(
    v.object({
      /** optional dictionary of string key/value pairs. The max total length is 1000. */
      metadata: v.nullish(
        v.pipe(v.record(v.string(), v.string()), v.maxEntries(1000))
      ),
      /** optional array of up to 25 users to be added to the lobby. Requests with more than 25 members are rejected. */
      members: v.pipe(
        v.array(
          v.object({
            /** Discord user id of the user to add to the lobby */
            id: snowflake,
            /** optional dictionary of string key/value pairs. The max total length is 1000. */
            metadata: v.nullish(
              v.pipe(v.record(v.string(), v.string()), v.maxEntries(1000))
            ),
            /** {@link LobbyMember | lobby member} flags combined as a bitfield */
            flags: v.exactOptional(
              asInteger(lobbyMemberFlag) as v.GenericSchema<number>
            ),
            /** an additional display name for the member, such as an in-game character name. 1-80 characters. When updating an existing member, omit the field to preserve their current value, or send `null` to clear it. */
            additionalName: v.nullish(boundedString({ min: 1, max: 80 }))
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
 * ### [Create Lobby](https://discord.com/developers/docs/resources/lobby#create-lobby)
 *
 * **POST** `/lobbies`
 *
 * Creates a new lobby, adding any of the specified members to it, if provided.
 *
 * Returns a lobby object.
 *
 * **Member Limits**
 *
 * Up to 25 members can be included in a single request. The array is not truncated. A request with more than 25 members fails with a `400` response and error code `50035` (`Invalid Form Body`), with a `BASE_TYPE_MAX_LENGTH` error on `members` in the `errors` object.
 *
 * A lobby can still hold up to 1,000 members. Add more with {@link addMemberToLobby | Add a Member to a Lobby}, or in batches of up to 25 with {@link bulkUpdateLobbyMembers | Bulk Update Lobby Members}.
 *
 * > [!NOTE]
 * >
 * > Discord Social SDK clients will not be able to join or leave a lobby created using this API, such as `Client::CreateOrJoinLobby`. See Managing Lobbies for more information.
 */
export const createLobby: Fetcher<typeof createLobbySchema, Lobby> = async ({
  body
}) => post(`/lobbies`, body);
