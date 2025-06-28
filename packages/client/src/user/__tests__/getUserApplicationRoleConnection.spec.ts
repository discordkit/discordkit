import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getUserApplicationRoleConnectionProcedure,
  getUserApplicationRoleConnectionQuery,
  getUserApplicationRoleConnectionSafe,
  getUserApplicationRoleConnectionSchema
} from "../getUserApplicationRoleConnection.js";
import { applicationRoleConnectionSchema } from "../../application/types/ApplicationRoleConnection.js";

describe(`getUserApplicationRoleConnection`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/users/@me/applications/:application/role-connection`,
    getUserApplicationRoleConnectionSchema,
    applicationRoleConnectionSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getUserApplicationRoleConnectionSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getUserApplicationRoleConnectionProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getUserApplicationRoleConnectionQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
