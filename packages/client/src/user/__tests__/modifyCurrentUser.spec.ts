import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import {
  modifyCurrentUser,
  modifyCurrentUserSchema
} from "../modifyCurrentUser.js";
import { userSchema } from "../types/User.js";

describe(`modifyCurrentUser`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/users/@me`,
    modifyCurrentUserSchema,
    userSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyCurrentUser,
        modifyCurrentUserSchema,
        userSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
