import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { getCurrentUser } from "../getCurrentUser.js";
import { userSchema } from "../types/User.js";

describe(`getCurrentUser`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(`/users/@me`, null, userSchema);

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getCurrentUser, null, userSchema)()
    ).resolves.toEqual(expected);
  });
});
