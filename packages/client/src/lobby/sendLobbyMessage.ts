import * as v from "valibot";
import { post, type Fetcher } from "@discordkit/core/requests/methods";
import { asInteger } from "@discordkit/core/validations/asInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { messageFlag } from "../messages/types/MessageFlag.js";
import type { LobbyMessage } from "./types/LobbyMessage.js";

export const sendLobbyMessageSchema = v.object({
  lobby: snowflake,
  body: v.object({
    /** message content. Must be non-empty. */
    content: boundedString(),
    /** optional dictionary of string key/value pairs delivered alongside the message to active clients via the Social SDK. Not persisted on the linked channel message. */
    metadata: v.exactOptional(v.nullable(v.record(v.string(), v.string()))),
    /** optional {@link MessageFlag | message flags} combined as a bitfield. Only flags creatable by the Social SDK are accepted. */
    flags: v.exactOptional(asInteger(messageFlag) as v.GenericSchema<number>)
  })
});

/**
 * ### [Send Lobby Message](https://discord.com/developers/docs/resources/lobby#send-lobby-message)
 *
 * **POST** `/lobbies/:lobby/messages`
 *
 * Sends a message to the specified lobby. The calling user must be a member of the lobby.
 *
 * Uses `Bearer` token for authorization with the `sdk.social_layer` scope.
 *
 * Returns the created {@link LobbyMessage | lobby message object}.
 *
 * > [!NOTE]
 * >
 * > If the lobby has a linked channel, the message is also forwarded to that channel. If forwarding fails (for example, due to AutoMod), the lobby message is still delivered to other lobby members.
 */
export const sendLobbyMessage: Fetcher<
  typeof sendLobbyMessageSchema,
  LobbyMessage
> = async ({ lobby, body }) => post(`/lobbies/${lobby}/messages`, body);
