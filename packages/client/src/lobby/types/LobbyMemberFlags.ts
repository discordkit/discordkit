/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
import { enum_ } from "valibot";
import { bitfield } from "@discordkit/core";

export enum LobbyMemberFlags {
  /** user can link a text channel to a lobby */
  CanLinkLobby = 1 << 0
}

export const lobbyMemberFlagsSchema = enum_(LobbyMemberFlags);
export const lobbyMemberFlag = bitfield(`lobbyMemberFlag`, LobbyMemberFlags);
