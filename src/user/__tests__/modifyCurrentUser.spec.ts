import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyCurrentUser,
  modifyCurrentUserProcedure,
  modifyCurrentUserSchema
} from "../modifyCurrentUser";
import { userSchema } from "../types/User";

describe(`modifyCurrentUser`, () => {
  const expected = mockRequest.patch(`/users/@me`, userSchema);
  const config = generateMock(modifyCurrentUserSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyCurrentUserProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyCurrentUser);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
