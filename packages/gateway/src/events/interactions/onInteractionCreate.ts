import type { Interaction } from "@discordkit/client/interactions/types/Interaction";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Interaction Create](https://discord.com/developers/docs/events/gateway-events#interaction-create)
 *
 * Sent when a user uses an
 * [application command](https://discord.com/developers/docs/interactions/application-commands)
 * or [message component](https://discord.com/developers/docs/components/reference).
 *
 * Never gated by an intent — interactions are always delivered, because they're
 * a direct response to a user acting on *your* app.
 *
 * Respond with `@discordkit/client`'s interaction-response fetchers. Discord
 * expects an initial response within 3 seconds; defer if the work takes longer.
 *
 * @example
 * ```ts
 * using sub = onInteractionCreate(async (interaction) => {
 *   if (interaction.type !== InteractionType.APPLICATION_COMMAND) return;
 *   await createInteractionResponse({ ... });
 * });
 * ```
 */
export const onInteractionCreate = dispatchEvent<
  Interaction,
  `INTERACTION_CREATE`
>(`INTERACTION_CREATE`);
