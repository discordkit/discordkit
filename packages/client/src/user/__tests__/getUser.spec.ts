import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getUserProcedure,
  getUserQuery,
  getUserSafe,
  getUserSchema
} from "../getUser.js";
import { userSchema } from "../types/User.js";

describe(`getUser`, () => {
  const expected = mockRequest.get(`/users/:user`, userSchema);
  const config = mockSchema(getUserSchema);

  it(`can be used standalone`, async () => {
    await expect(getUserSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(getUserProcedure)(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getUserQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
