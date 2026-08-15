import { dispatchEvent } from "../dispatch.js";
import type { MessageCreate } from "./types/MessageCreate.js";

/**
 * ### [Message Create](https://discord.com/developers/docs/events/gateway-events#message-create)
 *
 * Sent when a message is created. The payload is a message object plus
 * `guildId`, `member`, `mentions`, and `channelType`.
 *
 * Gated by `GUILD_MESSAGES` (guild channels) and/or `DIRECT_MESSAGES` (DMs) —
 * request whichever you need, or both.
 *
 * > [!WARNING]
 * >
 * > Reading `content` also requires the **privileged** `MESSAGE_CONTENT`
 * > intent. Without it the event still fires, but `content`, `embeds`,
 * > `attachments`, `components`, and `poll` are **empty** — a silent failure,
 * > not an error.
 *
 * @example
 * ```ts
 * using sub = onMessageCreate((message) => {
 *   if (message.author.bot) return;
 *   console.log(message.content);
 * });
 * ```
 */
export const onMessageCreate = dispatchEvent<MessageCreate, `MESSAGE_CREATE`>(
  `MESSAGE_CREATE`,
  [`GUILD_MESSAGES`, `DIRECT_MESSAGES`]
);
