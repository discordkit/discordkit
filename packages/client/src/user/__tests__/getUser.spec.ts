import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getUserProcedure,
  getUserQuery,
  getUserSafe,
  getUserSchema
} from "../getUser.js";
import { userSchema } from "../types/User.js";

describe(`getUser`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/users/:user`,
    getUserSchema,
    userSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getUserSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(getUserProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getUserQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
