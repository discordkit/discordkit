import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Resumed](https://discord.com/developers/docs/events/gateway-events#resumed)
 *
 * Sent when a resumed session finishes replaying the events it missed while
 * disconnected. Its payload carries no fields.
 *
 * Never gated by an intent. Useful as the signal that a reconnect fully caught
 * up — before it, events are historical replay rather than live traffic.
 *
 * @example
 * ```ts
 * using sub = onResumed(() => {
 *   console.log(`Caught up after reconnecting`);
 * });
 * ```
 */
export const onResumed = dispatchEvent<undefined, `RESUMED`>(`RESUMED`);
