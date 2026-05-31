import * as v from "valibot";
import { snowflake, asInteger, schema } from "@discordkit/core";
import { lobbyMemberFlag } from "./LobbyMemberFlags.js";

const _lobbyMemberSchema = v.object({
  /** the id of the user */
  id: snowflake,
  /** dictionary of string key/value pairs. The max total length is 1000. */
  metadata: v.nullish(
    v.pipe(v.record(v.string(), v.string()), v.maxEntries(1000))
  ),
  /** lobby member flags combined as a bitfield */
  flags: v.exactOptional(asInteger(lobbyMemberFlag) as v.GenericSchema<number>)
});

export interface LobbyMember extends v.InferOutput<typeof _lobbyMemberSchema> {}

/**
 * ### [Lobby Member](https://discord.com/developers/docs/resources/lobby#lobby-member-object)
 *
 * Represents a member of a lobby, including optional metadata and flags.
 */
export const lobbyMemberSchema = schema<LobbyMember>(_lobbyMemberSchema);
