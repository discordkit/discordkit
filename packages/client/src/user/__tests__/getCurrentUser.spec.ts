import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getCurrentUserProcedure,
  getCurrentUserQuery,
  getCurrentUserSafe
} from "../getCurrentUser.js";
import { userSchema } from "../types/User.js";

describe(`getCurrentUser`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(`/users/@me`, null, userSchema);

  it(`can be used standalone`, async () => {
    await expect(getCurrentUserSafe()).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(getCurrentUserProcedure)()).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getCurrentUserQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
