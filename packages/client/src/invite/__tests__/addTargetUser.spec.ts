import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { addTargetUser, addTargetUserSchema } from "../addTargetUser.js";

describe(`addTargetUser`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/invites/:code/target-users/:user`,
    addTargetUserSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(addTargetUser, addTargetUserSchema)(config)
    ).resolves.not.toThrow();
  });
});
