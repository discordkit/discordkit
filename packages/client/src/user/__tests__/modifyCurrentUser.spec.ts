import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyCurrentUser,
  modifyCurrentUserProcedure,
  modifyCurrentUserSafe,
  modifyCurrentUserSchema
} from "../modifyCurrentUser.js";
import { userSchema } from "../types/User.js";

describe(`modifyCurrentUser`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/users/@me`,
    modifyCurrentUserSchema,
    userSchema
  );

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
