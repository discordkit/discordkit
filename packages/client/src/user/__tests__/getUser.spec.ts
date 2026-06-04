import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { getUserSchema, getUser } from "../getUser.js";
import { userSchema } from "../types/User.js";

describe(`getUser`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/users/:user`,
    getUserSchema,
    userSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getUser, getUserSchema, userSchema)(config)
    ).resolves.toEqual(expected);
  });
});
