import {
  exactOptional,
  type GenericSchema,
  maxEntries,
  nullish,
  object,
  pipe,
  record,
  string,
  type InferOutput
} from "valibot";
import { snowflake, asInteger } from "@discordkit/core";
import { lobbyMemberFlag } from "./LobbyMemberFlags.js";

/** Represents a member of a lobby, including optional metadata and flags. */
export const lobbyMemberSchema = object({
  /** the id of the user */
  id: snowflake,
  /** dictionary of string key/value pairs. The max total length is 1000. */
  metaday: nullish(pipe(record(string(), string()), maxEntries(1000))),
  /** lobby member flags combined as a bitfield */
  flags: exactOptional(asInteger(lobbyMemberFlag) as GenericSchema<number>)
});

export type LobbyMember = InferOutput<typeof lobbyMemberSchema>;
