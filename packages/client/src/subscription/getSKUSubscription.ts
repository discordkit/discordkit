import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type Subscription } from "./types/Subscription.js";

export const getSKUSubscriptionSchema = v.object({
  sku: snowflake,
  subscription: snowflake
});

/**
 * ### [Get SKU Subscription](https://discord.com/developers/docs/resources/subscription#get-sku-subscription)
 *
 * **GET** `/skus/:sku/subscriptions/:subscription`
 *
 * Get a subscription by its ID. Returns a subscription object.
 */
export const getSKUSubscription: Fetcher<
  typeof getSKUSubscriptionSchema,
  Subscription
> = async ({ sku, subscription }) =>
  get(`/skus/${sku}/subscriptions/${subscription}`);
