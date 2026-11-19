import * as v from "valibot";
import { put, type Fetcher } from "@discordkit/core/requests/methods";
import { asInteger } from "@discordkit/core/validations/asInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { LobbyMember } from "./types/LobbyMember.js";
import { lobbyMemberFlag } from "./types/LobbyMemberFlags.js";

export const addMemberToLobbySchema = v.object({
  lobby: snowflake,
  user: snowflake,
  body: v.exactOptional(
    v.partial(
      v.object({
        metadata: v.nullish(
          v.pipe(v.record(v.string(), v.string()), v.maxEntries(1000))
        ),
        flags: asInteger(lobbyMemberFlag) as v.GenericSchema<number>,
        /** an additional display name for the member, such as an in-game character name. 1-80 characters. Omit the field to preserve the member's current value, or send `null` to clear it. */
        additionalName: v.nullable(boundedString({ min: 1, max: 80 }))
      })
    )
  )
});

/**
 * ### [Add a Member to a Lobby](https://discord.com/developers/docs/resources/lobby#add-a-member-to-a-lobby)
 *
 * **PUT** `/lobbies/:lobby/members/:user`
 *
 * Adds the provided user to the specified lobby. If called when the user is already a member of the lobby will update fields such as metadata on that user instead.
 *
 * Returns the {@link LobbyMember | lobby member object}.
 */
export const addMemberToLobby: Fetcher<
  typeof addMemberToLobbySchema,
  LobbyMember
> = async ({ lobby, user, body }) =>
  put(`/lobbies/${lobby}/members/${user}`, body);
