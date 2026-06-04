/* oxlint-disable @typescript-eslint/prefer-literal-enum-member */
import * as v from "valibot";
import { bitfield } from "@discordkit/core/validations/bitfield";

/**
 * ### [Lobby Member Flags](https://discord.com/developers/docs/resources/lobby#lobby-member-object-lobby-member-flags)
 */
export enum LobbyMemberFlags {
  /** user can link a text channel to a lobby */
  CanLinkLobby = 1 << 0
}

export const lobbyMemberFlagsSchema = v.enum_(LobbyMemberFlags);
export const lobbyMemberFlag = bitfield(`lobbyMemberFlag`, LobbyMemberFlags);
