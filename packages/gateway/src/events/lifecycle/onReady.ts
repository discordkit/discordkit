import { dispatchEvent } from "../dispatch.js";
import type { Ready } from "./types/Ready.js";

/**
 * ### [Ready](https://discord.com/developers/docs/events/gateway-events#ready)
 *
 * Dispatched when a client has completed the initial handshake with the gateway
 * (for new sessions). Contains all the state required to begin interacting with
 * the rest of the platform.
 *
 * `guilds` start out unavailable and become available via later
 * {@link onGuildCreate | Guild Create} events, so a bot that needs guild data
 * should wait for those rather than reading `READY`'s list.
 *
 * Never gated by an intent — Discord always sends it.
 *
 * @example
 * ```ts
 * using sub = onReady(({ user, guilds }) => {
 *   console.log(`Logged in as ${user.username}, ${guilds.length} guilds`);
 * });
 * ```
 */
export const onReady = dispatchEvent<Ready, `READY`>(`READY`);
