/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
import * as v from "valibot";
import { bitfield } from "@discordkit/core";

/**
 * For subscriptions, there are two types of access levels you can offer to users:
 *
 * - **Guild Subscriptions**: A subscription purchased by a user and applied to a single server. Everyone in that server gets your premium benefits.
 * - **User Subscriptions**: A subscription purchased by a user for themselves. They get access to your premium benefits in every server.
 *
 * The `flags` field can be used to differentiate user and server subscriptions with a bitwise `&` operator.
 */
export enum SKUFlags {
  /** SKU is available for purchase */
  AVAILABLE = 1 << 2,
  /** Recurring SKU that can be purchased by a user and applied to a single server. Grants access to every user in that server. */
  GUILD_SUBSCRIPTION = 1 << 7,
  /** Recurring SKU purchased by a user for themselves. Grants access to the purchasing user in every server. */
  USER_SUBSCRIPTION = 1 << 8
}

export const skuFlagsSchema = v.enum_(SKUFlags);
export const skuFlag = bitfield(`skuFlag`, SKUFlags);
