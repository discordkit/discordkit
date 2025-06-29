import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getSKUSubscriptionProcedure,
  getSKUSubscriptionQuery,
  getSKUSubscriptionSafe,
  getSKUSubscriptionSchema
} from "../getSKUSubscription.js";
import { subscriptionSchema } from "../types/Subscription.js";

describe(`getSKUSubscription`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/skus/:sku/subscriptions/:subscription`,
    getSKUSubscriptionSchema,
    subscriptionSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getSKUSubscriptionSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getSKUSubscriptionProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getSKUSubscriptionQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
