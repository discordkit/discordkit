import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  consumeAnEntitlement,
  consumeAnEntitlementSchema
} from "../consumeAnEntitlement.js";

describe(`consumeAnEntitlement`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/applications/:application/entitlements/:entitlement/consume`,
    consumeAnEntitlementSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(consumeAnEntitlement, consumeAnEntitlementSchema)(config)
    ).resolves.not.toThrow();
  });
});
