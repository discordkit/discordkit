import type { Subscription } from "@discordkit/client/subscription/types/Subscription";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Subscription Create](https://discord.com/developers/docs/events/gateway-events#subscription-create)
 *
 * Sent when a subscription for a SKU is created.
 *
 * Never gated by an intent.
 */
export const onSubscriptionCreate = dispatchEvent<
  Subscription,
  `SUBSCRIPTION_CREATE`
>(`SUBSCRIPTION_CREATE`);
