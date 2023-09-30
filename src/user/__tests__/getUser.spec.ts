import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getUserProcedure,
  getUserQuery,
  getUserSafe,
  getUserSchema
} from "../getUser";
import { userSchema } from "../types/User";

describe(`getUser`, () => {
  const expected = mockRequest.get(`/users/:user`, userSchema);
  const config = generateMock(getUserSchema);

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
