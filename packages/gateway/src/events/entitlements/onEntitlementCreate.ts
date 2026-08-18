import type { Entitlement } from "@discordkit/client/entitlements/types/Entitlement";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Entitlement Create](https://discord.com/developers/docs/events/gateway-events#entitlement-create)
 *
 * Sent when a user subscribes to a SKU.
 *
 * Never gated by an intent.
 */
export const onEntitlementCreate = dispatchEvent<
  Entitlement,
  `ENTITLEMENT_CREATE`
>(`ENTITLEMENT_CREATE`);
