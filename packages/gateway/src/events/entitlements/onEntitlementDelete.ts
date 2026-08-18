import type { Entitlement } from "@discordkit/client/entitlements/types/Entitlement";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Entitlement Delete](https://discord.com/developers/docs/events/gateway-events#entitlement-delete)
 *
 * Sent when an entitlement is deleted. The inner payload is an entitlement
 * object.
 *
 * Never gated by an intent — Discord always sends it.
 */
export const onEntitlementDelete = dispatchEvent<
  Entitlement,
  `ENTITLEMENT_DELETE`
>(`ENTITLEMENT_DELETE`);
