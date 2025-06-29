import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getEntitlementProcedure,
  getEntitlementQuery,
  getEntitlementSafe,
  getEntitlementSchema
} from "../getEntitlement.js";
import { entitlementSchema } from "../types/Entitlement.js";

describe(`getEntitlement`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/entitlements/:entitlement`,
    getEntitlementSchema,
    entitlementSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getEntitlementSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getEntitlementProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getEntitlementQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
