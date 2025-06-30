import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  consumeEntitlement,
  consumeEntitlementProcedure,
  consumeEntitlementSafe,
  consumeEntitlementSchema
} from "../consumeEntitlement.js";

describe(`consumeEntitlement`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/applications/:application/entitlements/:entitlement/consume`,
    consumeEntitlementSchema
  );

  it(`can be used standalone`, async () => {
    await expect(consumeEntitlementSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(consumeEntitlementProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(consumeEntitlement);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
