import type { Entitlement } from "@discordkit/client/entitlements/types/Entitlement";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Entitlement Update](https://discord.com/developers/docs/events/gateway-events#entitlement-update)
 *
 * Sent when a user's entitlement is updated — e.g. renewed. Check `endsAt` to tell a renewal from a cancellation.
 *
 * Never gated by an intent.
 */
export const onEntitlementUpdate = dispatchEvent<
  Entitlement,
  `ENTITLEMENT_UPDATE`
>(`ENTITLEMENT_UPDATE`);
