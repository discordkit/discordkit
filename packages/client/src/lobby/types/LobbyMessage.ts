import * as v from "valibot";
import { asInteger } from "@discordkit/core/validations/asInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { messageFlag } from "../../messages/types/MessageFlag.js";
import { messageTypeSchema } from "../../messages/types/MessageType.js";
import { userSchema } from "../../user/types/User.js";

const _lobbyMessageSchema = v.object({
  /** id of the message */
  id: snowflake,
  /** {@link MessageType | message type} */
  type: messageTypeSchema,
  /** message content */
  content: v.string(),
  /** id of the lobby this message was sent to */
  lobbyId: snowflake,
  /** included for compatibility with the messages interface; equal to `lobbyId` */
  channelId: snowflake,
  /** the {@link User | user} who sent the message */
  author: userSchema,
  /** contains a single `additionalName` string — the author's {@link LobbyMember | lobby member} additional display name, captured when the message was sent. Omitted if the author had no `additionalName` set. */
  lobbyMember: v.exactOptional(
    v.object({
      additionalName: boundedString({ min: 1, max: 80 })
    })
  ),
  /** dispatch-only metadata sent with the message */
  metadata: v.exactOptional(v.nullable(v.record(v.string(), v.string()))),
  /** moderation metadata set via Update Lobby Message Moderation Metadata */
  moderationMetadata: v.exactOptional(
    v.nullable(v.record(v.string(), v.string()))
  ),
  /** {@link MessageFlag | message flags} bitfield */
  flags: asInteger(messageFlag) as v.GenericSchema<number>,
  /** the application that sent the message */
  applicationId: snowflake
});

export interface LobbyMessage extends v.InferOutput<
  typeof _lobbyMessageSchema
> {}

/**
 * ### [Lobby Message](https://discord.com/developers/docs/resources/lobby#send-lobby-message-lobby-message-object)
 *
 * A message sent to a lobby, as returned by Send Lobby Message and Get Lobby Messages.
 */
export const lobbyMessageSchema = schema<LobbyMessage>(_lobbyMessageSchema);
