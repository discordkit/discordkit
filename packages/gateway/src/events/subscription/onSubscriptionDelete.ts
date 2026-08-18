import type { Subscription } from "@discordkit/client/subscription/types/Subscription";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Subscription Delete](https://discord.com/developers/docs/events/gateway-events#subscription-delete)
 *
 * Sent when a Subscription for a Premium App has been deleted. Inner payload
 * is a Subscription object.
 *
 * Never gated by an intent — Discord always sends it.
 */
export const onSubscriptionDelete = dispatchEvent<
  Subscription,
  `SUBSCRIPTION_DELETE`
>(`SUBSCRIPTION_DELETE`);
