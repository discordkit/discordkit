import * as v from "valibot";
import { post, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { LobbyInvite } from "./types/LobbyInvite.js";

export const createLobbyChannelInviteForSelfSchema = v.object({
  lobby: snowflake
});

/**
 * ### [Create Lobby Channel Invite for Self](https://discord.com/developers/docs/resources/lobby#create-lobby-channel-invite-for-self)
 *
 * **POST** `/lobbies/:lobby/members/@me/invites`
 *
 * Creates a single-use guild invite to the lobby's linked channel, targeted at the calling user. The lobby must have a linked channel and the caller must be a member of the lobby. The invite expires after one hour.
 *
 * Uses `Bearer` token for authorization with the `sdk.social_layer` scope.
 *
 * Returns a {@link LobbyInvite | lobby invite object}.
 */
export const createLobbyChannelInviteForSelf: Fetcher<
  typeof createLobbyChannelInviteForSelfSchema,
  LobbyInvite
> = async ({ lobby }) => post(`/lobbies/${lobby}/members/@me/invites`);
