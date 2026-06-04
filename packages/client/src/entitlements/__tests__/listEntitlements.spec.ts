import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { entitlementSchema } from "../types/Entitlement.js";
import {
  listEntitlementsSchema,
  listEntitlements
} from "../listEntitlements.js";

describe(`listEntitlements`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/entitlements`,
    listEntitlementsSchema,
    v.pipe(v.array(entitlementSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listEntitlements,
        listEntitlementsSchema,
        v.pipe(v.array(entitlementSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
