import * as v from "valibot";
import { asInteger } from "@discordkit/core/validations/asInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { lobbyMemberFlag } from "./LobbyMemberFlags.js";

const _lobbyMemberSchema = v.object({
  /** the id of the user */
  id: snowflake,
  /** dictionary of string key/value pairs. The max total length is 1000. */
  metadata: v.nullish(
    v.pipe(v.record(v.string(), v.string()), v.maxEntries(1000))
  ),
  /** lobby member flags combined as a bitfield */
  flags: v.exactOptional(asInteger(lobbyMemberFlag) as v.GenericSchema<number>),
  /** an additional 1-80 character display name for the member, such as an in-game character name. Can only be set through the HTTP API, not from a Social SDK client. */
  additionalName: v.exactOptional(boundedString({ min: 1, max: 80 }))
});

export interface LobbyMember extends v.InferOutput<typeof _lobbyMemberSchema> {}

/**
 * ### [Lobby Member](https://discord.com/developers/docs/resources/lobby#lobby-member-object)
 *
 * Represents a member of a lobby, including optional metadata and flags.
 */
export const lobbyMemberSchema = schema<LobbyMember>(_lobbyMemberSchema);
