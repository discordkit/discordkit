import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  modifyCurrentUser,
  modifyCurrentUserProcedure,
  modifyCurrentUserSafe,
  modifyCurrentUserSchema
} from "../modifyCurrentUser.js";
import { userSchema } from "../types/User.js";

describe(`modifyCurrentUser`, () => {
  const expected = mockRequest.patch(`/users/@me`, userSchema);
  const config = mockSchema(modifyCurrentUserSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyCurrentUserSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyCurrentUserProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyCurrentUser);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
