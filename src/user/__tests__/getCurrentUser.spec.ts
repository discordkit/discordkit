import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getCurrentUserProcedure,
  getCurrentUserQuery
} from "../getCurrentUser";
import { userSchema } from "../types/User";

describe(`getCurrentUser`, () => {
  const expected = mockRequest.get(`/users/@me`, userSchema);

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
