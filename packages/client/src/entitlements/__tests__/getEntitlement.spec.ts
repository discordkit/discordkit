import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { getEntitlementSchema, getEntitlement } from "../getEntitlement.js";
import { entitlementSchema } from "../types/Entitlement.js";

describe(`getEntitlement`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/entitlements/:entitlement`,
    getEntitlementSchema,
    entitlementSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getEntitlement,
        getEntitlementSchema,
        entitlementSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
