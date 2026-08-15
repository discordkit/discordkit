import { dispatchEvent } from "../dispatch.js";
import type { TypingStart } from "./types/PresenceEvents.js";

/**
 * ### [Typing Start](https://discord.com/developers/docs/events/gateway-events#typing-start)
 *
 * Sent when a user starts typing in a channel. Carries `member` in guilds.
 *
 * `timestamp` is Unix **seconds** — multiply by 1000 before `new Date()`.
 *
 * Gated by `GUILD_MESSAGE_TYPING` or `DIRECT_MESSAGE_TYPING`.
 */
export const onTypingStart = dispatchEvent<TypingStart, `TYPING_START`>(
  `TYPING_START`
);
