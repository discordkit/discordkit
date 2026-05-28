import * as v from "valibot";
import {
  post,
  type Fetcher,
  snowflake,
  asInteger,
  boundedArray
} from "@discordkit/core";
import { type LobbyMember } from "./types/LobbyMember.js";
import { lobbyMemberFlag } from "./types/LobbyMemberFlags.js";

export const bulkUpdateLobbyMembersSchema = v.object({
  lobby: snowflake,
  /**
   * An array of member objects (1-25). Members with `removeMember: false`
   * (the default) are upserted; members with `removeMember: true` are
   * removed instead.
   */
  body: boundedArray(
    v.object({
      /** Discord user id of the user to add, update, or remove */
      id: snowflake,
      /** optional dictionary of string key/value pairs. The max total length is 1000. */
      metadata: v.exactOptional(
        v.nullable(v.pipe(v.record(v.string(), v.string()), v.maxEntries(1000)))
      ),
      /** lobby member flags combined as a bitfield */
      flags: v.exactOptional(
        asInteger(lobbyMemberFlag) as v.GenericSchema<number>
      ),
      /** if `true`, the user is removed from the lobby instead of upserted */
      removeMember: v.exactOptional(v.boolean())
    }),
    { min: 1, max: 25 }
  )
});

/**
 * ### [Bulk Update Lobby Members](https://discord.com/developers/docs/resources/lobby#bulk-update-lobby-members)
 *
 * **POST** `/lobbies/:lobby/members/bulk`
 *
 * Adds, updates, or removes up to 25 members from the specified lobby in
 * a single request. Members with `removeMember: false` (the default) are
 * upserted — added if not present, or updated with the provided metadata
 * and flags if already a member. Members with `removeMember: true` are
 * removed.
 *
 * Returns an array of {@link LobbyMember | lobby member objects} for the
 * upserted members. Removed members are not included in the response.
 *
 * > [!NOTE]
 * >
 * > Users unknown to Discord will return a `404 UNKNOWN_USER` error. Users
 * > that fail permission checks or who have already reached the maximum
 * > number of lobbies per application (and are not already a member of
 * > this lobby) are silently dropped from the upsert set.
 */
export const bulkUpdateLobbyMembers: Fetcher<
  typeof bulkUpdateLobbyMembersSchema,
  LobbyMember[]
> = async ({ lobby, body }) => post(`/lobbies/${lobby}/members/bulk`, body);
