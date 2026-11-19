import * as v from "valibot";
import { post, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { LobbyInvite } from "./types/LobbyInvite.js";

export const createLobbyChannelInviteForUserSchema = v.object({
  lobby: snowflake,
  user: snowflake
});

/**
 * ### [Create Lobby Channel Invite for User](https://discord.com/developers/docs/resources/lobby#create-lobby-channel-invite-for-user)
 *
 * **POST** `/lobbies/:lobby/members/:user/invites`
 *
 * Creates a single-use guild invite to the lobby's linked channel on behalf of an application, targeted at the specified user. The lobby must have a linked channel. The invite expires after one hour.
 *
 * Uses `Bot` token for authorization.
 *
 * Returns a {@link LobbyInvite | lobby invite object}.
 */
export const createLobbyChannelInviteForUser: Fetcher<
  typeof createLobbyChannelInviteForUserSchema,
  LobbyInvite
> = async ({ lobby, user }) =>
  post(`/lobbies/${lobby}/members/${user}/invites`);
