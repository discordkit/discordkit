import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getCurrentUserApplicationRoleConnectionProcedure,
  getCurrentUserApplicationRoleConnectionQuery,
  getCurrentUserApplicationRoleConnectionSafe,
  getCurrentUserApplicationRoleConnectionSchema
} from "../getCurrentUserApplicationRoleConnection.js";
import { applicationRoleConnectionSchema } from "../types/ApplicationRoleConnection.js";

describe(`getCurrentUserApplicationRoleConnection`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/users/@me/applications/:application/role-connection`,
    getCurrentUserApplicationRoleConnectionSchema,
    applicationRoleConnectionSchema
  );

  it(`can be used standalone`, async () => {
    await expect(
      getCurrentUserApplicationRoleConnectionSafe(config)
    ).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getCurrentUserApplicationRoleConnectionProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(
      getCurrentUserApplicationRoleConnectionQuery,
      config
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
