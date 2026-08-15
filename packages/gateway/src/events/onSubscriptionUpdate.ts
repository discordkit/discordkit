import type { Subscription } from "@discordkit/client/subscription/types/Subscription";
import { dispatchEvent } from "./dispatch.js";

/**
 * ### [Subscription Update](https://discord.com/developers/docs/events/gateway-events#subscription-update)
 *
 * Sent when a Subscription for a Premium App has been updated. Inner payload
 * is a Subscription object.
 *
 * Never gated by an intent — Discord always sends it.
 */
export const onSubscriptionUpdate = dispatchEvent<
  Subscription,
  `SUBSCRIPTION_UPDATE`
>(`SUBSCRIPTION_UPDATE`);
