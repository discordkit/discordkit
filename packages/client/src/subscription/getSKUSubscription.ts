import { object } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { subscriptionSchema, type Subscription } from "./types/Subscription.js";

export const getSKUSubscriptionSchema = object({
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

export const getSKUSubscriptionSafe = toValidated(
  getSKUSubscription,
  getSKUSubscriptionSchema,
  subscriptionSchema
);

export const getSKUSubscriptionProcedure = toProcedure(
  `query`,
  getSKUSubscription,
  getSKUSubscriptionSchema,
  subscriptionSchema
);

export const getSKUSubscriptionQuery = toQuery(getSKUSubscription);
