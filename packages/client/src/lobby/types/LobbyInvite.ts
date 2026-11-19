import * as v from "valibot";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema } from "@discordkit/core/validations/schema";

const _lobbyInviteSchema = v.object({
  /** the {@link Invite | invite} code for the lobby's linked channel */
  code: boundedString()
});

export interface LobbyInvite extends v.InferOutput<typeof _lobbyInviteSchema> {}

/**
 * ### [Lobby Invite](https://discord.com/developers/docs/resources/lobby#create-lobby-channel-invite-for-user-lobby-invite-object)
 *
 * A single-use guild invite to a lobby's linked channel.
 */
export const lobbyInviteSchema = schema<LobbyInvite>(_lobbyInviteSchema);
