import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import {
  getSKUSubscriptionSchema,
  getSKUSubscription
} from "../getSKUSubscription.js";
import { subscriptionSchema } from "../types/Subscription.js";

describe(`getSKUSubscription`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/skus/:sku/subscriptions/:subscription`,
    getSKUSubscriptionSchema,
    subscriptionSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getSKUSubscription,
        getSKUSubscriptionSchema,
        subscriptionSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
