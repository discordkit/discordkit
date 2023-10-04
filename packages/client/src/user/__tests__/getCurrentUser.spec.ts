import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  getCurrentUserProcedure,
  getCurrentUserQuery,
  getCurrentUserSafe
} from "../getCurrentUser.js";
import { userSchema } from "../types/User.js";

describe(`getCurrentUser`, () => {
  const expected = mockRequest.get(`/users/@me`, userSchema);

  it(`can be used standalone`, async () => {
    await expect(getCurrentUserSafe()).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getCurrentUserProcedure)()
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getCurrentUserQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
