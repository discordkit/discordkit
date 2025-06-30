import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  listEntitlementsProcedure,
  listEntitlementsQuery,
  listEntitlementsSafe,
  listEntitlementsSchema
} from "../listEntitlements.js";
import { entitlementSchema } from "../types/Entitlement.js";

describe(`listEntitlements`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/entitlements`,
    listEntitlementsSchema,
    pipe(array(entitlementSchema), length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(listEntitlementsSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listEntitlementsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listEntitlementsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
