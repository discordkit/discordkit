import { dispatchEvent } from "../dispatch.js";
import type { MessageCreate } from "./types/MessageCreate.js";

/**
 * ### [Message Update](https://discord.com/developers/docs/events/gateway-events#message-update)
 *
 * Sent when a message is updated. The docs specify the payload is a message
 * object "with the same extra fields as `MESSAGE_CREATE`", so it reuses that
 * type rather than the bare {@link Message} — otherwise `guildId`, `member`,
 * and `channelType` would look absent when they are in fact delivered.
 *
 * Gated by `GUILD_MESSAGES` or `DIRECT_MESSAGES`.
 *
 * > [!WARNING]
 * >
 * > Like `MESSAGE_CREATE`, reading `content` also needs the privileged
 * > `MESSAGE_CONTENT` intent; without it the field arrives empty rather than
 * > erroring.
 */
export const onMessageUpdate = dispatchEvent<MessageCreate, `MESSAGE_UPDATE`>(
  `MESSAGE_UPDATE`,
  [`GUILD_MESSAGES`, `DIRECT_MESSAGES`]
);
